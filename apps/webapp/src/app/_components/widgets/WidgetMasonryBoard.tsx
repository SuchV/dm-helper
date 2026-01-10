/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {DragCancelEvent, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { toast } from "@repo/ui/toast";
import { cn } from "@repo/ui";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

import WidgetContainer from "./WidgetContainer";
import type { WidgetInstanceWithState } from "./widget-types";

const ROW_HEIGHT_PX = 14;
const ROW_GAP_PX = 12;

const computeRowSpan = (height: number) => {
  const total = ROW_HEIGHT_PX + ROW_GAP_PX;
  return Math.max(1, Math.ceil((height + ROW_GAP_PX) / total));
};

interface WidgetMasonryBoardProps {
  widgets: WidgetInstanceWithState[];
}

interface WidgetDimensions { width: number; height: number }

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const WidgetMasonryBoard: React.FC<WidgetMasonryBoardProps> = ({ widgets }) => {
  const router = useRouter();
  const updateWidgetMutation = api.widget.update.useMutation();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overlaySize, setOverlaySize] = React.useState<WidgetDimensions | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [_, startTransition] = React.useTransition();
  const widgetMeasurementsRef = React.useRef<Map<string, WidgetDimensions>>(new Map());

  // Guard against invalid widgets prop
  const safeWidgets = React.useMemo(() => {
    return Array.isArray(widgets) ? widgets : [];
  }, [widgets]);

  const sortedWidgets = React.useMemo(() => {
    return [...safeWidgets].sort((a, b) => a.position - b.position);
  }, [safeWidgets]);

  const initialOrder = React.useMemo(() => sortedWidgets.map((widget) => widget.id), [sortedWidgets]);

  const [orderedIds, setOrderedIds] = React.useState<string[]>(() => initialOrder);
  const orderedIdsRef = React.useRef<string[]>(initialOrder);
  const pendingOrderRef = React.useRef<string[] | null>(null);
  const lastSyncedIdsRef = React.useRef<string[]>(initialOrder);

  const [collapsedState, setCollapsedState] = React.useState<Record<string, boolean>>(() => {
    return Object.fromEntries(sortedWidgets.map((widget) => [widget.id, widget.collapsed] as const));
  });

  React.useEffect(() => {
    orderedIdsRef.current = orderedIds;
  }, [orderedIds]);

  React.useEffect(() => {
    if (pendingOrderRef.current) {
      lastSyncedIdsRef.current = initialOrder;
      return;
    }

    if (!arraysEqual(initialOrder, orderedIdsRef.current)) {
      setOrderedIds(initialOrder);
      orderedIdsRef.current = initialOrder;
    }

    lastSyncedIdsRef.current = initialOrder;
  }, [initialOrder]);

  React.useEffect(() => {
    setCollapsedState(
      Object.fromEntries(sortedWidgets.map((widget) => [widget.id, widget.collapsed] as const)) as Record<string, boolean>,
    );
  }, [sortedWidgets]);

  React.useEffect(() => {
    setIsMounted(true);
    return () => {
      pendingOrderRef.current = null;
      setIsMounted(false);
    };
  }, []);

  const itemsById = React.useMemo(() => {
    return new Map(sortedWidgets.map((widget) => [widget.id, widget]));
  }, [sortedWidgets]);

  const orderedWidgets = React.useMemo(() => {
    return orderedIds
      .map((id) => itemsById.get(id))
      .filter((widget): widget is WidgetInstanceWithState => Boolean(widget));
  }, [itemsById, orderedIds]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const persistOrder = React.useCallback(
    (ids: string[]) => {
      pendingOrderRef.current = ids;
      void (async () => {
        try {
          await Promise.all(
            ids.map((id, position) =>
              updateWidgetMutation.mutateAsync({
                id,
                position,
              }),
            ),
          );
          lastSyncedIdsRef.current = ids;
          pendingOrderRef.current = null;
          startTransition(() => {
            router.refresh();
          });
        } catch (error) {
          console.error(error);
          toast.error("Unable to reorder widgets");
          const fallback = lastSyncedIdsRef.current;
          setOrderedIds(fallback);
          orderedIdsRef.current = fallback;
          pendingOrderRef.current = null;
        }
      })();
    },
    [router, startTransition, updateWidgetMutation],
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    setOverlaySize(widgetMeasurementsRef.current.get(id) ?? null);
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        setActiveId(null);
        setOverlaySize(null);
        return;
      }

      const currentOrder = orderedIdsRef.current;
      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        setActiveId(null);
        setOverlaySize(null);
        return;
      }

      const nextOrder = arrayMove(currentOrder, oldIndex, newIndex);
      setOrderedIds(nextOrder);
      orderedIdsRef.current = nextOrder;
      persistOrder(nextOrder);
      setActiveId(null);
      setOverlaySize(null);
    },
    [persistOrder],
  );

  const handleDragCancel = React.useCallback((_: DragCancelEvent) => {
    setActiveId(null);
    setOverlaySize(null);
  }, []);
  const handleItemMeasure = React.useCallback((id: string, size: WidgetDimensions) => {
    widgetMeasurementsRef.current.set(id, size);
    if (activeId === id) {
      setOverlaySize(size);
    }
  }, [activeId]);


  const instanceNumberById = React.useMemo(() => {
    const counters: Record<string, number> = {};
    const map = new Map<string, number>();
    orderedWidgets.forEach((widget) => {
      const nextCount = (counters[widget.type] ?? 0) + 1;
      counters[widget.type] = nextCount;
      map.set(widget.id, nextCount);
    });
    return map;
  }, [orderedWidgets]);

  const instanceCountByType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    orderedWidgets.forEach((widget) => {
      counts[widget.type] = (counts[widget.type] ?? 0) + 1;
    });
    return counts;
  }, [orderedWidgets]);

  const activeWidget = activeId ? itemsById.get(activeId) ?? null : null;

  const handleLocalCollapsedChange = React.useCallback((id: string, collapsed: boolean) => {
    setCollapsedState((prev) => ({ ...prev, [id]: collapsed }));
  }, []);

  if (!isMounted) {
    return (
      <div
        className="grid grid-flow-row-dense items-start md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        style={{
          gridAutoRows: `${ROW_HEIGHT_PX}px`,
          gap: `${ROW_GAP_PX}px`,
        }}
      >
        {sortedWidgets.map((widget) => (
          <div key={widget.id}>
            <WidgetContainer
              widget={widget}
              instanceNumber={1}
              totalInstancesOfType={1}
              collapsedOverride={widget.collapsed}
              onCollapsedOverride={undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
        <div
          className="grid grid-flow-row-dense items-start md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          style={{
            gridAutoRows: `${ROW_HEIGHT_PX}px`,
            gap: `${ROW_GAP_PX}px`,
          }}
        >
          {orderedWidgets.map((widget) => {
            const spanClass = widget.type === "pdf-viewer"
              ? "md:col-span-2 lg:col-span-2 2xl:col-span-2 min-[2200px]:col-span-3"
              : undefined;

            return (
              <SortableMasonryItem
                key={widget.id}
                widgetId={widget.id}
                className={spanClass}
                onDimensionChange={handleItemMeasure}
              >
                <WidgetContainer
                  widget={widget}
                  instanceNumber={instanceNumberById.get(widget.id) ?? undefined}
                  totalInstancesOfType={instanceCountByType[widget.type] ?? 0}
                  collapsedOverride={collapsedState[widget.id] ?? widget.collapsed}
                  onCollapsedOverride={(next) => handleLocalCollapsedChange(widget.id, next)}
                />
              </SortableMasonryItem>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {activeWidget ? (
          <div
            className="pointer-events-none"
            style={overlaySize ? { width: overlaySize.width, maxWidth: "100%" } : undefined}
          >
            <WidgetContainer
              widget={activeWidget}
              instanceNumber={instanceNumberById.get(activeWidget.id) ?? undefined}
              collapsedOverride={collapsedState[activeWidget.id] ?? activeWidget.collapsed}
              onCollapsedOverride={(next) => handleLocalCollapsedChange(activeWidget.id, next)}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableMasonryItemProps {
  widgetId: string;
  children: React.ReactElement<{ dragHandleProps?: React.HTMLAttributes<HTMLDivElement> }>;
  className?: string;
  onDimensionChange?: (id: string, size: WidgetDimensions) => void;
}

const SortableMasonryItem: React.FC<SortableMasonryItemProps> = ({ widgetId, children, className, onDimensionChange }) => {
  const [rowSpan, setRowSpan] = React.useState(1);
  const [measuredNode, setMeasuredNode] = React.useState<HTMLDivElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widgetId });

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const measureRef = React.useCallback((node: HTMLDivElement | null) => {
    setMeasuredNode(node);
  }, []);

  React.useEffect(() => {
    if (!measuredNode) return;

    const handleMeasurement = (rect: DOMRectReadOnly) => {
      setRowSpan((prev) => {
        const next = computeRowSpan(rect.height);
        return prev === next ? prev : next;
      });
      onDimensionChange?.(widgetId, { width: rect.width, height: rect.height });
    };

    handleMeasurement(measuredNode.getBoundingClientRect());

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target !== measuredNode) continue;
        handleMeasurement(entry.contentRect);
      }
    });

    observer.observe(measuredNode);
    return () => observer.disconnect();
  }, [measuredNode, onDimensionChange, widgetId]);

  const style: React.CSSProperties = {
    gridRowEnd: `span ${rowSpan}`,
    transform: stringifyTransform(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  // Combine drag handle attributes and listeners for the header
  const dragHandleProps = {
    ...attributes,
    ...listeners,
  } as React.HTMLAttributes<HTMLDivElement>;

  return (
    <div
      ref={composedRef}
      style={style}
      className={cn(
        "self-start rounded-2xl",
        isDragging && "z-20 opacity-90",
        className,
      )}
    >
      <div ref={measureRef} data-drag-handle>
        {React.cloneElement(children, { dragHandleProps })}
      </div>
    </div>
  );
};

export default WidgetMasonryBoard;

const stringifyTransform = (
  transform: { x: number; y: number } | null,
): string | undefined => {
  if (!transform) return undefined;
  const { x, y } = transform;
  return `translate3d(${x}px, ${y}px, 0)`;
};
