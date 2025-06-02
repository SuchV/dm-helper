import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  profile: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
