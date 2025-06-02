import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const discordRouter = createTRPCRouter({
  adminGuilds: protectedProcedure
    .input(z.object({ access_token: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.discord.getUserAdminGuilds(input.access_token);
    }),
});
