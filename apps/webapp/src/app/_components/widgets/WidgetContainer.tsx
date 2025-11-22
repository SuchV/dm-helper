"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { toast } from "@repo/ui/toast";

import { api } from "~/trpc/react";
import GameClockPanel from "~/app/_components/main/GameClockPanel";
import NotesWidget from "~/app/_components/widgets/notes/NotesWidget";
import DiceRollerWidget from "~/app/_components/widgets/dice/DiceRollerWidget";

import type { WidgetInstanceWithState } from "./widget-types";

import WidgetShell from "./WidgetShell";

type WidgetMeta = {
  [Type in WidgetInstanceWithState["type"]]: {
    title: string;
    description?: string;
    render: (options: { widget: WidgetInstanceWithState }) => React.ReactNode;
    showInstanceNumber?: boolean;
  };
};

const widgetMeta: WidgetMeta = {
  "game-clock": {
    title: "Game Clock",
    description: "Manage the in-game time and calendar.",
    render: ({ widget }) => <GameClockPanel widgetId={widget.id} />,
  },
  notes: {
    title: "Notes",
    description: "Organize sticky notes for quick reference.",
    render: ({ widget }) => <NotesWidget widgetId={widget.id} />,
    showInstanceNumber: false,
  },
  "dice-roller": {
    title: "Dice Roller",
    description: "Build a dice pool and roll with modifiers.",
    render: ({ widget }) => <DiceRollerWidget widgetId={widget.id} />,
    showInstanceNumber: false,
  },
};

const WidgetContainer = ({
  widget,
  instanceNumber,
}: {
  widget: WidgetInstanceWithState;
  instanceNumber?: number;
}) => {
  const router = useRouter();
  const removeMutation = api.widget.remove.useMutation({
    onSuccess: () => router.refresh(),
    onError: (error) => {
      toast.error(error.message ?? "Failed to remove widget");
    },
  });

  const updateMutation = api.widget.update.useMutation({
    onError: (error) => {
      toast.error(error.message ?? "Failed to update widget");
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
    updateMutation.mutate({ id: widget.id, collapsed });
  };

  const shouldShowNumber = metadata.showInstanceNumber ?? true;
  const title = instanceNumber && shouldShowNumber ? `${metadata.title} ${instanceNumber}` : metadata.title;

  return (
    <WidgetShell
      title={title}
      description={metadata.description}
      defaultCollapsed={widget.collapsed}
      onCollapsedChange={handleCollapsedChange}
      onRemove={handleRemove}
    >
      {metadata.render({ widget })}
    </WidgetShell>
  );
};

export default WidgetContainer;
