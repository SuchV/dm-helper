"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "@repo/ui/toast";
import { cn } from "@repo/ui";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

import WidgetContainer from "./WidgetContainer";
import type { WidgetInstanceWithState } from "./widget-types";

const ROW_HEIGHT_PX = 12;
const ROW_GAP_PX = 24;

const arrayMove = <T,>(list: T[], from: number, to: number): T[] => {
  const length = list.length;
  if (from === to) return list.slice();
  if (from < 0 || from >= length || to < 0 || to > length) {
    return list.slice();
  }
  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) {
    return list.slice();
  }
  next.splice(to, 0, item as T);
  return next;
};

const computeRowSpan = (height: number) => {
  const total = ROW_HEIGHT_PX + ROW_GAP_PX;
  return Math.max(1, Math.ceil((height + ROW_GAP_PX) / total));
};

interface WidgetMasonryBoardProps {
  widgets: WidgetInstanceWithState[];
}

const WidgetMasonryBoard: React.FC<WidgetMasonryBoardProps> = ({ widgets }) => {
  const router = useRouter();
  const updateWidgetMutation = api.widget.update.useMutation();

  const sortedWidgets = React.useMemo(() => {
    return [...widgets].sort((a, b) => a.position - b.position);
  }, [widgets]);

  const [orderedIds, setOrderedIds] = React.useState<string[]>(() => sortedWidgets.map((widget) => widget.id));
  const lastStableOrderRef = React.useRef<string[]>(orderedIds);

  React.useEffect(() => {
    const next = sortedWidgets.map((widget) => widget.id);
    setOrderedIds(next);
    lastStableOrderRef.current = next;
  }, [sortedWidgets]);

  const itemsById = React.useMemo(() => {
    const map = new Map(sortedWidgets.map((widget) => [widget.id, widget]));
    return map;
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
          lastStableOrderRef.current = ids;
          router.refresh();
        } catch (error) {
          console.error(error);
          toast.error("Unable to reorder widgets");
          setOrderedIds(lastStableOrderRef.current);
        }
      })();
    },
    [router, updateWidgetMutation],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setOrderedIds((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        const next = arrayMove(prev, oldIndex, newIndex);
        persistOrder(next);
        return next;
      });
    },
    [persistOrder],
  );

  const instanceCounters = React.useMemo(() => {
    const counters: Record<string, number> = {};
    return orderedWidgets.map((widget) => {
      counters[widget.type] = (counters[widget.type] ?? 0) + 1;
      return counters[widget.type];
    });
  }, [orderedWidgets]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div
        className="grid grid-flow-row-dense md:grid-cols-2 xl:grid-cols-3"
        style={{
          gridAutoRows: `${ROW_HEIGHT_PX}px`,
          rowGap: `${ROW_GAP_PX}px`,
          columnGap: `${ROW_GAP_PX}px`,
        }}
      >
        {orderedWidgets.map((widget, index) => (
          <SortableMasonryItem key={widget.id} widgetId={widget.id}>
            <WidgetContainer widget={widget} instanceNumber={instanceCounters[index]} />
          </SortableMasonryItem>
        ))}
      </div>
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

  const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({ id: widgetId });
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: widgetId });

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setDraggableNodeRef(node);
      setDroppableNodeRef(node);
    },
    [setDraggableNodeRef, setDroppableNodeRef],
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
    transition: transform ? "none" : undefined,
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
      <div ref={setObservedNode}>
        {children}
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
