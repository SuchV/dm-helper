import "server-only";

import type { ReactNode } from "react";

import {
  BasicPage,
  BasicPageContent,
  BasicPageFooter,
  BasicPageHeader,
} from "@repo/ui/recipes/basic-page";
import { Logo } from "@repo/ui/recipes/logo";
import { ThemeToggle } from "@repo/ui/theme";

import { Footer } from "./footer";
import { Navigation } from "./nav";
import UserAvatarButton from "~/app/_components/main/UserAvatarButton";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <BasicPage>
      <BasicPageHeader>
        <div className="flex-1">
          <Logo />
        </div>
        <Navigation />
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <UserAvatarButton />
        </div>
      </BasicPageHeader>
      <BasicPageContent>{children}</BasicPageContent>
    </BasicPage>
  );
};

export default Layout;
