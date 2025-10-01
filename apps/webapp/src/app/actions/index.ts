"use server";

import { signIn, signOut } from "@spolka-z-l-o/auth/react";
import { env } from "@spolka-z-l-o/env/next-env";

export const login = async () => {
  env.ENVIRONMENT === "local"
    ? await signIn("credentials")
    : await signIn("discord");
};

export const logout = async () => {
  await signOut();
};
