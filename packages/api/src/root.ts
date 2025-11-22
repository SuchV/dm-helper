import { diceRollerRouter } from "./router/dice-roller";
import { gameClockRouter } from "./router/game-clock";
import { noteRouter } from "./router/note";
import { userRouter } from "./router/user";
import { widgetRouter } from "./router/widget";
import { widgetStateRouter } from "./router/widget-state";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  gameClock: gameClockRouter,
  diceRoller: diceRollerRouter,
  note: noteRouter,
  widget: widgetRouter,
  widgetState: widgetStateRouter,
});

export type AppRouter = typeof appRouter;
