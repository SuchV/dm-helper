import { cache } from "react";
import { cookies, headers } from "next/headers";

import { createCaller, createTRPCContext } from "@repo/api";
import { env } from "@repo/env/next-env";
import { prisma } from "@repo/db";

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
    db: prisma,
  });
});

export const api = createCaller(createContext);
