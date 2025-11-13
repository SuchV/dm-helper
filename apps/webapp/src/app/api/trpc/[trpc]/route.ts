import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@repo/api";
import { env } from "@repo/env/next-env";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
// const setCorsHeaders = (res: Response) => {
//   res.headers.set("Access-Control-Allow-Origin", "*")
//   res.headers.set("Access-Control-Request-Method", "*");
//   res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
//   res.headers.set("Access-Control-Allow-Headers", "*");
// };

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  });

  // By default you don't need to set CORS headers since api is called from the same domain
  // setCorsHeaders(response);

  return response;
};

const handler = async (req: NextRequest) => {
  const cookieStore = await cookies();
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const context = await createTRPCContext({
    cookieStore,
    discord: {
      discordId: env.DISCORD_CLIENT_ID,
      discordSecret: env.DISCORD_CLIENT_SECRET,
      discordToken: env.DISCORD_CLIENT_TOKEN,
    },
    headers: req.headers,
    logLevel: env.LOG_LEVEL,
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () => context,
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  // By default you don't need to set CORS headers since api is called from the same domain
  // setCorsHeaders(response);

  return response;
};

export { handler as GET, handler as POST };
