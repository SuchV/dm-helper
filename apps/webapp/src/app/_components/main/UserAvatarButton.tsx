"use client";

import { api } from "~/trpc/react";
import { Skeleton } from "@repo/ui/skeleton";
import UserLoginButton from "~/app/_components/main/UserLoginButton";
import { signOut } from "@repo/auth/react";
import { UserMenu } from "@repo/ui/auth/user-menu";
import { ArrowRight } from "lucide-react";

const UserAvatarButton = () => {
  const { data: user, isLoading, error } = api.user.getUser.useQuery();

  if (isLoading) return <Skeleton className="size-10 rounded-full" />;

  if (error || !user?.user) {
    return (
      <>
        <div className="hidden sm:block">
          <UserLoginButton className="w-auto whitespace-nowrap" />
        </div>
        <div className="flex items-center gap-1 sm:hidden">
          <UserLoginButton variant="icon" />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <UserMenu
      name={user.user.name}
      email={user.user.email}
      image={user.user.image}
      onSignOut={() => signOut({ callbackUrl: "/" })}
    />
  );
};

export default UserAvatarButton;
