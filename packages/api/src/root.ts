import { discordRouter } from "./router/discord";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  discord: discordRouter,
});

export type AppRouter = typeof appRouter;
