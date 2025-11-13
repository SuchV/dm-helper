import NextAuth, { NextAuthResult, Session, User } from "next-auth";

import { env } from "@spolka-z-l-o/env/next-env";

import { authConfig } from "./config";

const authResult = NextAuth(authConfig);

export const handlers: NextAuthResult["handlers"] = authResult.handlers;
export const auth: NextAuthResult["auth"] = authResult.auth;
export const signIn: NextAuthResult["signIn"] = authResult.signIn;
export const signOut: NextAuthResult["signOut"] = authResult.signOut;
// export * from "./middleware";
export type { Session } from "next-auth";
