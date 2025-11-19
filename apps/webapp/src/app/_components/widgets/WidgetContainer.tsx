"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { RouterOutputs } from "@repo/api";
import { toast } from "@repo/ui/toast";

import { api } from "~/trpc/react";
import GameClockPanel from "~/app/_components/main/GameClockPanel";

import WidgetShell from "./WidgetShell";

type WidgetItem = RouterOutputs["widget"]["list"][number];

type WidgetMeta = {
  [Type in WidgetItem["type"]]: {
    title: string;
    description?: string;
    render: (options: { widget: WidgetItem }) => React.ReactNode;
  };
};

const widgetMeta: WidgetMeta = {
  "game-clock": {
    title: "Game Clock",
    description: "Manage the in-game time and calendar.",
    render: ({ widget }) => <GameClockPanel widgetId={widget.id} />,
  },
};

const WidgetContainer = ({
  widget,
  instanceNumber,
}: {
  widget: WidgetItem;
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

  const title = instanceNumber ? `${metadata.title} ${instanceNumber}` : metadata.title;

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
