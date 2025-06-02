import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";

import prisma from "@spolka-z-l-o/db";

import "next-auth/jwt";

import { env } from "@spolka-z-l-o/env/next-env";

export const authConfig: NextAuthOptions = {
  debug: env.NODE_ENV === "development",
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  basePath: "/api/auth",
  session: {
    strategy: "database",
  },
};
