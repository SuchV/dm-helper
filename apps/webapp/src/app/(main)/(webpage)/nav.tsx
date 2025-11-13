"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import {
  BasicPageNav,
  BasicPageNavItem,
} from "@repo/ui/recipes/basic-page";

const Navigation = () => {
  const segment = useSelectedLayoutSegment();
  return (
    <BasicPageNav>
      <BasicPageNavItem href="/" isActive={!segment}>
        Home
      </BasicPageNavItem>
      <BasicPageNavItem href="/guild" isActive={segment === "guild"}>
        Guilds
      </BasicPageNavItem>
    </BasicPageNav>
  );
};

export { Navigation };
