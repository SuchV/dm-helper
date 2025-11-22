import * as React from "react";
import { ChevronDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { cn } from "..";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onSignOut?: () => void;
  className?: string;
}

const initials = (name?: string | null, fallback?: string | null) => {
  if (name && name.trim().length > 0) {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (fallback && fallback.length > 0) {
    return fallback.charAt(0).toUpperCase();
  }
  return "?";
};

const UserMenu = ({ name, email, image, onSignOut, className }: UserMenuProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-3 rounded-full border border-border/60 bg-background px-3 py-1.5 text-left shadow-sm transition hover:border-border",
          className,
        )}
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={image ?? undefined} alt={name ?? "User avatar"} />
          <AvatarFallback>{initials(name, email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-[120px] flex-1">
          {name ? (
            <p className="text-sm font-medium leading-tight">{name}</p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">User</p>
          )}
          {email ? (
            <p className="text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open ? "-scale-y-100" : "scale-y-100",
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={(event) => {
            event.preventDefault();
            onSignOut?.();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UserMenu };
