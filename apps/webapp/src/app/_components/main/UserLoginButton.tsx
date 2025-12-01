"use client";

import * as React from "react";

import { AuthButton } from "@repo/ui/auth/auth-button";
import { signOut } from "@repo/auth/react";
import { Skeleton } from "@repo/ui/skeleton";
import { cn } from "@repo/ui";
import { api } from "~/trpc/react";
import { login } from "~/app/actions";
import { useRouter } from "next/navigation";

const UserLoginButton = () => {
  const {
    data: session,
    isLoading,
    error,
  } = api.user.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const router = useRouter();
  const utils = api.useUtils();

  const handleLogout = async () => {
    console.log("[Client] Logout button clicked");
    try {
      await signOut({ callbackUrl: "/" });
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
      <AuthButton type="button" intent="logout" onClick={handleLogout} className="w-full">
        Sign out, {session.user.name}
      </AuthButton>
    );
  }

  return (
    <AuthButton
      type="button"
      intent="login"
      onClick={handleLogin}
      className="w-full justify-center gap-3"
    >
      <GoogleGlyph />
      Continue with Google
    </AuthButton>
  );
};

export default UserLoginButton;

const GoogleGlyph = () => {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full",
        "border border-primary-foreground/40 bg-primary-foreground/10",
        "text-sm font-semibold uppercase tracking-tight text-primary-foreground",
      )}
    >
      G
    </span>
  );
};
