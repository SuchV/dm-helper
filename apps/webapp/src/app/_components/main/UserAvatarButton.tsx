"use client";

import { api } from "~/trpc/react";
import { Skeleton } from "@repo/ui/skeleton";
import UserLoginButton from "~/app/_components/main/UserLoginButton";
import { signOut } from "@repo/auth/react";
import { UserMenu } from "@repo/ui/auth/user-menu";

const UserAvatarButton = () => {
  const { data: user, isLoading, error } = api.user.getUser.useQuery();

  if (isLoading) return <Skeleton className="size-12 rounded-full" />;

  if (error || !user?.user) {
    return <UserLoginButton />;
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
