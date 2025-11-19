import { gameClockRouter } from "./router/game-clock";
import { userRouter } from "./router/user";
import { widgetRouter } from "./router/widget";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  gameClock: gameClockRouter,
  widget: widgetRouter,
});

export type AppRouter = typeof appRouter;
