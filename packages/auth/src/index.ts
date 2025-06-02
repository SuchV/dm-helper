import NextAuth from "next-auth";

import { authConfig } from "./config";

export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);

export type { Session } from "next-auth";
