import { gameClockRouter } from "./router/game-clock";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  gameClock: gameClockRouter,
});

export type AppRouter = typeof appRouter;
