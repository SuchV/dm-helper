"use client";

import { Button } from "@repo/ui/button";
import { type Session } from "@repo/auth";
import { api } from "~/trpc/react";
import { login, logout } from "~/app/actions";
import { useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/skeleton";

const UserLoginButton = () => {
  const { data: session, isLoading, error } = api.user.getUser.useQuery();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const handleLogin = async () => {
    await login();
    router.refresh();
  };

  if (isLoading) {
    return (
      <Skeleton className="h-10 w-full rounded-md bg-background-secondary text-muted-foreground" />
    );
  }

  if (session?.user) {
    return (
      <Button
        type="button"
        className="text-white hover:bg-red-600 bg-destructive"
        onClick={handleLogout}
      >
        Sign out, {session.user.name}
      </Button>
    );
  }

  return (
    <Button type="button" onClick={handleLogin}>
      Login to Discord
    </Button>
  );
};

export default UserLoginButton;
