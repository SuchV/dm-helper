"use server";

import { signIn } from "@repo/auth";
import { env } from "@repo/env/next-env";

export const login = async () => {
  if (env.ENVIRONMENT === "local") {
    await signIn("credentials");
    return;
  }

  await signIn("google");
};
