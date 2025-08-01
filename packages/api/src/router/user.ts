import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});
