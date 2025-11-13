import { cache } from "react";
import { cookies, headers } from "next/headers";

import { createCaller, createTRPCContext } from "@repo/api";
import { env } from "@repo/env/next-env";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  const cookieStore = await cookies();

  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
    cookieStore,
    discord: {
      discordId: env.DISCORD_CLIENT_ID,
      discordSecret: env.DISCORD_CLIENT_SECRET,
      discordToken: env.DISCORD_CLIENT_TOKEN,
    },
  });
});

export const api = createCaller(createContext);
