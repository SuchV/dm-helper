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
    </BasicPageNav>
  );
};

export { Navigation };
