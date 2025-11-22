"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";

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

  const handleAddWidget = (type: "game-clock" | "notes") => {
    addWidgetMutation.mutate({ type });
  };
  return (
    <BasicPageNav className="w-full max-w-xl">
      <BasicPageNavItem href="/" isActive={!segment}>
        Home
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
              Game Clock
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={addWidgetMutation.isPending}
              onClick={() => handleAddWidget("notes")}
            >
              Notes
            </DropdownMenuItem>
            <DropdownMenuItem disabled>More widgets coming soon</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-10" />
    </BasicPageNav>
  );
};

export { Navigation };
