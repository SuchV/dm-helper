"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Clock3, Dice6, FileText, StickyNote } from "lucide-react";

import { toast } from "@repo/ui/toast";

import { api } from "~/trpc/react";
import GameClockPanel from "~/app/_components/main/GameClockPanel";
import NotesWidget from "~/app/_components/widgets/notes/NotesWidget";
import DiceRollerWidget from "~/app/_components/widgets/dice/DiceRollerWidget";

import type { WidgetInstanceWithState } from "./widget-types";

import WidgetShell from "./WidgetShell";

// Lazy load PDF viewer to avoid SSR issues with pdfjs-dist
const PdfViewerWidget = dynamic(
  () => import("~/app/_components/widgets/pdf/PdfViewerWidget"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading PDF viewer...</div>
      </div>
    ),
  }
);

type WidgetMeta = Record<
  WidgetInstanceWithState["type"],
  {
    title: string;
    description?: string;
    render: (options: { widget: WidgetInstanceWithState }) => React.ReactNode;
    showInstanceNumber?: boolean;
    icon: React.ReactNode;
  }
>;

const widgetMeta: WidgetMeta = {
  "game-clock": {
    title: "Game Clock",
    description: "Manage the in-game time and calendar.",
    render: ({ widget }) => <GameClockPanel widgetId={widget.id} />,
    icon: <Clock3 className="h-4 w-4" aria-hidden />,
  },
  notes: {
    title: "Notes",
    description: "Organize sticky notes for quick reference.",
    render: ({ widget }) => <NotesWidget widgetId={widget.id} />,
    showInstanceNumber: false,
    icon: <StickyNote className="h-4 w-4" aria-hidden />,
  },
  "dice-roller": {
    title: "Dice Roller",
    description: "Build a dice pool and roll with modifiers.",
    render: ({ widget }) => <DiceRollerWidget widgetId={widget.id} />,
    icon: <Dice6 className="h-4 w-4" aria-hidden />,
  },
  "pdf-viewer": {
    title: "PDF Viewer",
    description: "Import rulebooks or references and bookmark key pages.",
    render: ({ widget }) => <PdfViewerWidget widgetId={widget.id} />,
    icon: <FileText className="h-4 w-4" aria-hidden />,
  },
};

interface WidgetContainerProps {
  widget: WidgetInstanceWithState;
  instanceNumber?: number;
  totalInstancesOfType?: number;
  collapsedOverride?: boolean;
  onCollapsedOverride?: (collapsed: boolean) => void;
  isDragging?: boolean;
}

const WidgetContainer = ({
  widget,
  instanceNumber,
  totalInstancesOfType,
  collapsedOverride,
  onCollapsedOverride,
  isDragging = false,
}: WidgetContainerProps) => {
  const router = useRouter();
  const removeMutation = api.widget.remove.useMutation({
    onSuccess: () => router.refresh(),
    onError: (error) => {
      toast.error(error.message || "Failed to remove widget");
    },
  });

  const updateMutation = api.widget.update.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to update widget");
    },
  });

  const metadata = widgetMeta[widget.type];

  if (!metadata) {
    return null;
  }

  const handleRemove = async () => {
    await removeMutation.mutateAsync({ id: widget.id });
  };

  const handleCollapsedChange = (collapsed: boolean) => {
    onCollapsedOverride?.(collapsed);
    updateMutation.mutate({ id: widget.id, collapsed });
  };

  const shouldShowNumber = Boolean(
    instanceNumber &&
      (metadata.showInstanceNumber ?? true) &&
      (totalInstancesOfType ?? 0) > 1,
  );
  const title = shouldShowNumber ? `${metadata.title} ${instanceNumber}` : metadata.title;
  const bodyClassName = widget.type === "pdf-viewer"
    ? "flex min-h-[65vh] flex-col p-0"
    : undefined;

  return (
    <WidgetShell
      title={title}
      icon={metadata.icon}
      description={metadata.description}
      defaultCollapsed={widget.collapsed}
      collapsed={collapsedOverride}
      onCollapsedChange={handleCollapsedChange}
      onRemove={handleRemove}
      bodyClassName={bodyClassName}
    >
      {isDragging && widget.type === "pdf-viewer" ? (
        <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
          PDF Viewer
        </div>
      ) : (
        metadata.render({ widget })
      )}
    </WidgetShell>
  );
};

export default WidgetContainer;
