"use client";

import * as React from "react";

import { AuthButton } from "@repo/ui/auth/auth-button";
import { signOut } from "@repo/auth/react";
import { Skeleton } from "@repo/ui/skeleton";
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
      <GoogleIcon className="h-5 w-5" />
      Continue with Google
    </AuthButton>
  );
};

export default UserLoginButton;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="#EA4335"
      d="M12 5.09c1.4 0 2.66.48 3.65 1.41l2.73-2.73C16.71 1.69 14.55.79 12 .79 7.73.79 3.99 3.24 2.34 7.01l3.35 2.6C6.6 7.07 9.03 5.09 12 5.09z"
    />
    <path
      fill="#34A853"
      d="M21.8 12.18c0-.74-.07-1.45-.21-2.13H12v4.02h5.52c-.24 1.26-.97 2.33-2.06 3.04l3.2 2.49c1.88-1.74 3.14-4.31 3.14-7.42z"
    />
    <path
      fill="#4285F4"
      d="M6.44 14.21c-.3-.89-.47-1.84-.47-2.82 0-.98.16-1.93.47-2.82L3.1 6c-.74 1.48-1.16 3.15-1.16 4.99s.42 3.51 1.16 4.99l3.34-2.77z"
    />
    <path
      fill="#FBBC05"
      d="M12 22.21c2.55 0 4.71-.84 6.28-2.29l-3.2-2.49c-.89.6-2.03.95-3.08.95-2.97 0-5.4-1.98-6.31-4.67l-3.35 2.6C3.99 20.76 7.73 23.21 12 23.21z"
    />
  </svg>
);
