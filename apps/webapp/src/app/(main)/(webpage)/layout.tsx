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
import { auth } from "@repo/auth";

import { Footer } from "./footer";
import { Navigation } from "./nav";
import UserAvatarButton from "~/app/_components/main/UserAvatarButton";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <BasicPage>
      <BasicPageHeader>
        <div className="flex flex-1 min-w-0 items-center">
          <Logo className="shrink-0" />
        </div>
        <div className="flex flex-1 justify-center">
          {session?.user ? <Navigation /> : null}
        </div>
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
