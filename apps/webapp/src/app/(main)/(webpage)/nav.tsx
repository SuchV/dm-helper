"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Clock3, Dice6, FileText, StickyNote } from "lucide-react";

import { toast } from "@repo/ui/toast";

import { BasicPageNav, BasicPageNavItem } from "@repo/ui/recipes/basic-page";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

import { NavActionButton } from "@repo/ui/nav-action-button";
import { api } from "~/trpc/react";

const Navigation = () => {
  const segment = useSelectedLayoutSegment();
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
    <BasicPageNav className="w-full px-0">
      <BasicPageNavItem href="/" isActive={!segment}>
        
      </BasicPageNavItem>

      <div className="flex flex-1 justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <NavActionButton>+</NavActionButton>
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
      </div>
      <div className="w-10" />
    </BasicPageNav>
  );
};

export { Navigation };
