import Link from "next/link";

import { cn } from "..";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

interface BasicPageProps {
  children?: React.ReactNode;
  className?: string;
}

const BasicPage = ({ children, className }: BasicPageProps) => {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      {children}
    </div>
  );
};

interface BasicPageHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

const BasicPageHeader = ({ children, className }: BasicPageHeaderProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center">{children}</div>
      </div>
    </header>
  );
};

interface BasicPageNavProps {
  children?: React.ReactNode;
  className?: string;
}

const BasicPageNav = ({ children, className }: BasicPageNavProps) => {
  return (
    <nav className={cn("mx-auto flex items-center gap-6 px-6", className)}>
      {children}
    </nav>
  );
};

interface BasicPageNavItemProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  isActive?: boolean;
}

const BasicPageNavItem = ({
  children,
  className,
  href,
  isActive,
}: BasicPageNavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
};

interface BasicPageContentProps {
  children?: React.ReactNode;
  className?: string;
}

const BasicPageContent = ({ children, className }: BasicPageContentProps) => {
  return (
    <main className={cn("container flex-1 py-6", className)}>{children}</main>
  );
};

interface BasicPageAuthProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  } | null;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onSignOut?: () => void;
}

const BasicPageAuth = ({
  user,
  onSignIn,
  onSignUp,
  onSignOut,
}: BasicPageAuthProps) => {
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8" aria-description="Current user avatar">
              <AvatarImage src={user.image} alt={user.name ?? "User avatar"} />
              <AvatarFallback className="uppercase">
                {user.name?.charAt(0) ?? user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              {user.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              onSignOut?.();
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={onSignIn}>
        Sign in
      </Button>
      <Button onClick={onSignUp}>Sign up</Button>
    </div>
  );
};

interface BasicPageFooterProps {
  children?: React.ReactNode;
  className?: string;
}

const BasicPageFooter = ({ children, className }: BasicPageFooterProps) => {
  return (
    <footer className={cn("border-t bg-background py-6", className)}>
      <div className="container">{children}</div>
    </footer>
  );
};

export {
  BasicPage,
  BasicPageHeader,
  BasicPageNav,
  BasicPageNavItem,
  BasicPageAuth,
  BasicPageContent,
  BasicPageFooter,
};
