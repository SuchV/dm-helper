"use server";

import { signIn, signOut } from "@repo/auth/react";
import { env } from "@repo/env/next-env";

export const login = async () => {
  env.ENVIRONMENT === "local"
    ? await signIn("credentials")
    : await signIn("discord");
};

export const logout = async () => {
  await signOut();
};
