import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Account, NextAuthConfig, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials, {
  CredentialInput,
  CredentialsConfig,
} from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@repo/db";
import { env } from "@repo/env/next-env";

import { getUser } from "./credentials";

export const authConfig: NextAuthConfig = {
  debug: process.env.AUTH_DEBUG === "true",
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      type: "credentials",
      id: "credentials",
      credentials: {
        login: {
          label: "Login",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async ({ login, password }) => {
        const user = await prisma.user.findFirst({
          where: {
            accounts: {
              some: {
                provider: "local",
                providerAccountId: login as string,
              },
            },
          },
        });
        return user;
      },
      name: "credentials",
    } satisfies CredentialsConfig),
  ],

  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  session: { strategy: "database" },
  basePath: "/api/auth",
  callbacks: {
    async session({
      session,
      user,
    }: {
      session: Session;
      user: User;
    }): Promise<Session> {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
