"use server";

import { signIn, signOut } from "@repo/auth";
import { env } from "@repo/env/next-env";

export const login = async () => {
  env.ENVIRONMENT === "local"
    ? await signIn("credentials")
    : await signIn("google");
};

export const logout = async () => {
  console.log("[Server Action] Logout called");
  try {
    console.log("[Server Action] Calling signOut...");
    await signOut({ redirect: false });
    console.log("[Server Action] SignOut completed");
    return { success: true };
  } catch (error) {
    console.error("[Server Action] Logout error:", error);
    return { success: false, error: String(error) };
  }
};
