"use client";

import { Button } from "@repo/ui/button";
import { type Session } from "@repo/auth";
import { api } from "~/trpc/react";
import { login, logout } from "~/app/actions";
import { useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/skeleton";

const UserLoginButton = () => {
  const { data: session, isLoading, error } = api.user.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const router = useRouter();
  const utils = api.useUtils();

  const handleLogout = async () => {
    console.log("[Client] Logout button clicked");
    console.log("[Client] Current session:", session);
    try {
      console.log("[Client] Calling logout action...");
      const result = await logout();
      console.log("[Client] Logout action result:", result);
      if (result?.success) {
        console.log("[Client] Invalidating queries...");
        // Clear the cache before navigation
        utils.user.getUser.invalidate();
        console.log("[Client] Navigating to home...");
        router.push("/");
        router.refresh();
      } else {
        console.error("[Client] Logout failed:", result?.error);
      }
    } catch (error) {
      console.error("[Client] Logout error:", error);
    }
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
      Login to Dashboard
    </Button>
  );
};

export default UserLoginButton;
