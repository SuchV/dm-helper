"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
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

const ROW_HEIGHT_PX = 12;
const ROW_GAP_PX = 24;

const computeRowSpan = (height: number) => {
  const total = ROW_HEIGHT_PX + ROW_GAP_PX;
  return Math.max(1, Math.ceil((height + ROW_GAP_PX) / total));
};

interface WidgetMasonryBoardProps {
  widgets: WidgetInstanceWithState[];
}

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
  const [isMounted, setIsMounted] = React.useState(false);
  const [_, startTransition] = React.useTransition();

  const sortedWidgets = React.useMemo(() => {
    return [...widgets].sort((a, b) => a.position - b.position);
  }, [widgets]);

  const initialOrder = React.useMemo(() => sortedWidgets.map((widget) => widget.id), [sortedWidgets]);

  const [orderedIds, setOrderedIds] = React.useState<string[]>(initialOrder);
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
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        setActiveId(null);
        return;
      }

      const currentOrder = orderedIdsRef.current;
      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        setActiveId(null);
        return;
      }

      const nextOrder = arrayMove(currentOrder, oldIndex, newIndex);
      setOrderedIds(nextOrder);
      orderedIdsRef.current = nextOrder;
      persistOrder(nextOrder);
      setActiveId(null);
    },
    [persistOrder],
  );

  const handleDragCancel = React.useCallback((_: DragCancelEvent) => {
    setActiveId(null);
  }, []);

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

  const activeWidget = activeId ? itemsById.get(activeId) ?? null : null;

  const handleLocalCollapsedChange = React.useCallback((id: string, collapsed: boolean) => {
    setCollapsedState((prev) => ({ ...prev, [id]: collapsed }));
  }, []);

  if (!isMounted) {
    return null;
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
          className="grid grid-flow-row-dense md:grid-cols-2 xl:grid-cols-3"
          style={{
            gridAutoRows: `${ROW_HEIGHT_PX}px`,
            rowGap: `${ROW_GAP_PX}px`,
            columnGap: `${ROW_GAP_PX}px`,
          }}
        >
          {orderedWidgets.map((widget) => (
            <SortableMasonryItem key={widget.id} widgetId={widget.id}>
              <WidgetContainer
                widget={widget}
                instanceNumber={instanceNumberById.get(widget.id) ?? undefined}
                collapsedOverride={collapsedState[widget.id] ?? widget.collapsed}
                onCollapsedOverride={(next) => handleLocalCollapsedChange(widget.id, next)}
              />
            </SortableMasonryItem>
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {activeWidget ? (
          <div className="pointer-events-none w-[min(420px,calc(100vw-2rem))] max-w-xl">
            <WidgetContainer
              widget={activeWidget}
              instanceNumber={instanceNumberById.get(activeWidget.id) ?? undefined}
              collapsedOverride={collapsedState[activeWidget.id] ?? activeWidget.collapsed}
              onCollapsedOverride={(next) => handleLocalCollapsedChange(activeWidget.id, next)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableMasonryItemProps {
  widgetId: string;
  children: React.ReactNode;
}

const SortableMasonryItem: React.FC<SortableMasonryItemProps> = ({ widgetId, children }) => {
  const [rowSpan, setRowSpan] = React.useState(1);
  const [observedNode, setObservedNode] = React.useState<HTMLDivElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widgetId });

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      setObservedNode(node);
    },
    [setNodeRef],
  );

  React.useEffect(() => {
    if (!observedNode) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextSpan = computeRowSpan(entry.contentRect.height);
        setRowSpan(nextSpan);
      }
    });

    observer.observe(observedNode);
    return () => observer.disconnect();
  }, [observedNode]);

  const style: React.CSSProperties = {
    gridRowEnd: `span ${rowSpan}`,
    transform: stringifyTransform(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={composedRef}
      style={style}
      className={cn(
        "rounded-2xl",
        isDragging ? "z-20 cursor-grabbing opacity-90" : "cursor-grab",
      )}
      {...attributes}
      {...listeners}
    >
      <div ref={setObservedNode}>{children}</div>
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
