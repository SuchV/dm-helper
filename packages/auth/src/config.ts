import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { OAuth2Routes } from "discord-api-types/v10";
import { Account, NextAuthConfig, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Discord from "next-auth/providers/discord";
import { signIn } from "next-auth/react";

import { prisma } from "@spolka-z-l-o/db";
import { env } from "@spolka-z-l-o/env/next-env";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(providerAccountId: string, token: any) {
  try {
    const response = await fetch(OAuth2Routes.tokenURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    const newTokens = refreshedTokens as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    const updateRes = await prisma.account.update({
      data: {
        access_token: newTokens.access_token,
        expires_at: Math.floor(Date.now() / 1000) + newTokens.expires_in,
        refresh_token: newTokens.refresh_token ?? token.refreshToken,
      },
      where: {
        provider_providerAccountId: {
          provider: "discord",
          providerAccountId,
        },
      },
    });

    if (!updateRes) {
      throw new Error("Failed to update account with new tokens");
    }
  } catch (error) {
    throw new Error("RefreshAccessTokenError", {
      cause: error,
    });
  }
}

export const authConfig: NextAuthConfig = {
  debug: env.NODE_ENV === "development",
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          url: "https://discord.com/api/oauth2/authorize",
          scope: "identify email guilds",
        },
      },
    }),
  ],

  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  basePath: "/api/auth",
  callbacks: {
    async session({
      session,
      user,
    }: {
      session: Session & { error?: string };
      user: User;
    }): Promise<Session> {
      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: "discord",
        },
      });

      if (!account) {
        throw new Error("No Discord account found for user");
      }

      if (account.expires_at && account.expires_at < Date.now() / 1000) {
        try {
          // If the access token has expired, refresh it
          await refreshAccessToken(account.providerAccountId, {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at * 1000,
          });
        } catch (error: any) {
          session.error = error || "Failed to refresh access token";
        }
      }

      return session;
    },
  },
};
