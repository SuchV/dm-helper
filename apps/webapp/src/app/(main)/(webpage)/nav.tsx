"use client";

import { useRouter } from "next/navigation";
import { Clock3, Dice6, FileText, StickyNote } from "lucide-react";

import { toast } from "@repo/ui/toast";

import { BasicPageNav } from "@repo/ui/recipes/basic-page";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

import { NavActionButton } from "@repo/ui/nav-action-button";
import { api } from "~/trpc/react";

const Navigation = () => {
  const router = useRouter();
  const addWidgetMutation = api.widget.add.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Widget added to your dashboard");
    },
    onError: (error) => {
      toast.error(error.message ?? "Unable to add widget");
    },
  });

  const handleAddWidget = (
    type: "game-clock" | "notes" | "dice-roller" | "pdf-viewer",
  ) => {
    addWidgetMutation.mutate({ type });
  };
  return (
    <BasicPageNav
      aria-label="Dashboard navigation"
      className="w-auto justify-center px-0"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <NavActionButton aria-label="Add a widget">+</NavActionButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem
            disabled={addWidgetMutation.isPending}
            onClick={() => handleAddWidget("game-clock")}
          >
            <Clock3 className="mr-2 h-4 w-4 text-muted-foreground" />
            Game Clock
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={addWidgetMutation.isPending}
            onClick={() => handleAddWidget("notes")}
          >
            <StickyNote className="mr-2 h-4 w-4 text-muted-foreground" />
            Notes
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={addWidgetMutation.isPending}
            onClick={() => handleAddWidget("dice-roller")}
          >
            <Dice6 className="mr-2 h-4 w-4 text-muted-foreground" />
            Dice Roller
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={addWidgetMutation.isPending}
            onClick={() => handleAddWidget("pdf-viewer")}
          >
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            PDF Viewer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </BasicPageNav>
  );
};

export { Navigation };
