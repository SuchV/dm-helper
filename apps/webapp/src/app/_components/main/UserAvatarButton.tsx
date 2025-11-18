"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { Skeleton } from "@repo/ui/skeleton";
import UserLoginButton from "~/app/_components/main/UserLoginButton";
import { useState } from "react";
import { ChevronDown, Trash } from "lucide-react";
import { Separator } from "@repo/ui/separator";
import { signOut } from "@repo/auth/react";

const UserAvatarButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: user, isLoading, error } = api.user.getUser.useQuery();

  if (isLoading) return <Skeleton className="size-12 rounded-full" />;

  if (error || !user?.user) {
    return <UserLoginButton />;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex flex-row items-center justify-center gap-2 rounded-sm bg-background px-2 py-1">
        <Avatar>
          <AvatarFallback>...</AvatarFallback>
          <AvatarImage src={user?.user?.image ?? ""} alt="Loading" />
        </Avatar>
        <Separator orientation="vertical" className="h-12" />
        <ChevronDown
          className={
            "transition-transform" +
            (isOpen
              ? "[transform:rotateX(180deg)]"
              : "[transform:rotateX(0deg)]")
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-destructive-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <Trash className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatarButton;
