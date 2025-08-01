"use server";

import { signIn, signOut } from "@spolka-z-l-o/auth/react";

export const login = async () => {
  await signIn("discord");
};

export const logout = async () => {
  await signOut();
};
