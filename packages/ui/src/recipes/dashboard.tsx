import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { cn } from "..";
import { Button } from "../button";
import { Sheet, SheetContent, SheetTrigger } from "../dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

interface BaseProps {
  children?: React.ReactNode;
}

export const Dashboard = ({ children }: BaseProps) => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {children}
      </div>
    </TooltipProvider>
  );
};

export const Aside = ({ children }: BaseProps) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      {children}
    </aside>
  );
};

interface NavigationHomeItemProps {
  children: React.ReactNode;
  title: string;
  href: string;
}

export const NavigationHomeItem = ({
  children,
  title,
  href,
}: NavigationHomeItemProps) => {
  return (
    <Link
      href={href}
      className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
    >
      <Slot className="h-4 w-4 transition-all group-hover:scale-110">
        {children}
      </Slot>
      <span className="sr-only">{title}</span>
    </Link>
  );
};

interface NavigationProps {
  children?: React.ReactNode;
}

export const NavigationUpper = ({ children }: NavigationProps) => {
  return (
    <nav className="flex flex-col items-center gap-4 px-2 py-4">{children}</nav>
  );
};

export const NavigationLower = ({ children }: NavigationProps) => {
  return (
    <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
      {children}
    </nav>
  );
};

interface NavigationItemProps {
  children: React.ReactNode;
  title: React.ReactNode;
  href: string;
}

export const NavigationItem = ({
  href,
  children,
  title,
}: NavigationItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <Slot className="h-5 w-5">{children}</Slot>
          <span className="sr-only">{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
};

export const Content = ({ children }: BaseProps) => {
  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">{children}</div>
  );
};

export const Header = ({ children }: BaseProps) => {
  return (
    <header className="sm:bg-transparent sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:px-6">
      {children}
    </header>
  );
};

export const MobileNavigation = ({ children }: BaseProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">{children}</nav>
      </SheetContent>
    </Sheet>
  );
};

interface MobileNavigationHomeItemProps {
  children: React.ReactNode;
  title: string;
  href: string;
}

export const MobileNavigationHomeItem = ({
  children,
  href,
  title,
}: MobileNavigationHomeItemProps) => {
  return (
    <Link
      href={href}
      className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
    >
      <Slot className="h-5 w-5 transition-all group-hover:scale-110">
        {children}
      </Slot>
      <span className="sr-only">{title}</span>
    </Link>
  );
};

const mobileNavigationItemVariants = cva("flex items-center gap-4 px-2.5", {
  variants: {
    variant: {
      active: "text-foreground",
      inactive: "text-muted-foreground hover:text-foreground",
    },
  },
  defaultVariants: {
    variant: "inactive",
  },
});

interface MobileNavigationItemProps
  extends VariantProps<typeof mobileNavigationItemVariants> {
  children: React.ReactNode;
  title: string;
  href: string;
}

export const MobileNavigationItem = ({
  children,
  title,
  href,
  variant,
}: MobileNavigationItemProps) => {
  return (
    <Link href={href} className={cn(mobileNavigationItemVariants({ variant }))}>
      <Slot className="h-5 w-5">{children}</Slot>
      {title}
    </Link>
  );
};

export const Main = (props: BaseProps) => {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {props.children}
    </main>
  );
};
