"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import {
  BasicPageNav,
  BasicPageNavItem,
} from "@spolka-z-l-o/ui/recipes/basic-page";
import UserButton from "~/components/UserButton";

const Navigation = () => {
  const segment = useSelectedLayoutSegment();
  return (
    <BasicPageNav>
      <BasicPageNavItem href="/" isActive={!segment}>
        Home
      </BasicPageNavItem>
      <BasicPageNavItem href="/about" isActive={segment === "about"}>
        About
      </BasicPageNavItem>
    </BasicPageNav>
  );
};

export { Navigation };
