import { bingoRouter } from "./router/bingo";
import { birthdayRouter } from "./router/birthday";
import { discordRouter } from "./router/discord";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  discord: discordRouter,
  birthday: birthdayRouter,
  user: userRouter,
  bingo: bingoRouter,
});

export type AppRouter = typeof appRouter;
