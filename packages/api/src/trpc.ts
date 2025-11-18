/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { cookies } from "next/headers";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@repo/auth";
import { getSession } from "@repo/auth/credentials";
import { prisma } from "@repo/db";
import { env } from "@repo/env/next-env";

interface DiscordConfig {
  discordId: string;
  discordSecret: string;
  discordToken: string;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers?: Headers;
  cookieStore?: Awaited<ReturnType<typeof cookies>>;
  source?: string;
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  discord: DiscordConfig;
  db: typeof prisma;
}) => {
  const source = opts.headers?.get("x-trpc-source") ?? opts.source ?? "unknown";

  const dc =
    env.ENVIRONMENT !== "local";

  const db = prisma;

  const session = await auth();

  // const session = await auth();

  return {
    logLevel: opts.logLevel ?? "info",
    source,
    headers: opts.headers,
    protocol: opts.headers?.get("x-forwarded-proto") ?? "http",
    host:
      opts.headers?.get("x-forwarded-host") ??
      opts.headers?.get("host") ??
      "http://localhost:3000",
    session: session,
    discord: dc,
    db,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const baseProcedure = t.procedure;

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const cacheMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
//   if (type !== "query") {
//     console.log("Cache middleware skipped for non-query type:", type);
//     // Cache middleware only applies to queries
//     return next();
//   }

//   const pathParsed = path ?? "unknown";
//   const userId = ctx.session?.user?.id ?? "unknown";

//   const cachedResponse: unknown = memoryCache.getElem(pathParsed, userId);
//   if (cachedResponse) {
//     console.log(`Cache hit for: ${pathParsed} - ${userId}`);
//     console.log(`Cached response:`, cachedResponse);
//     return {
//       ok: true,
//       data: cachedResponse,
//       error: null,
//     };
//   }

//   const result = await next();

//   if (!result.ok) {
//     console.error(`Error in cache middleware: ${result.error.message}`);
//     return result;
//   }
//   console.log(`Cache miss for: ${pathParsed} - ${userId}, caching result.`);
//   memoryCache.setElem(pathParsed, userId, result.data);

//   return result;
// });

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure: typeof baseProcedure = baseProcedure;

export const protectedProcedure: typeof baseProcedure = baseProcedure
  // .use(cacheMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: ctx.session,
      },
    });
  });
