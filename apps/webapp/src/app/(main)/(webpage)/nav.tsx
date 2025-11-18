"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { BasicPageNav, BasicPageNavItem } from "@repo/ui/recipes/basic-page";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

import { Button } from "@repo/ui/button";

const Navigation = () => {
  const segment = useSelectedLayoutSegment();
  return (
    <BasicPageNav className="w-full max-w-xl">
      <BasicPageNavItem href="/" isActive={!segment}>
        Home
      </BasicPageNavItem>

      <div className="flex flex-1 justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-full" variant="outline">
              +
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem disabled>Widget 1 (coming soon)</DropdownMenuItem>
            <DropdownMenuItem disabled>Widget 2 (coming soon)</DropdownMenuItem>
            <DropdownMenuItem disabled>Widget 3 (coming soon)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-10" />
    </BasicPageNav>
  );
};

export { Navigation };
