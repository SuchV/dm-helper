import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const stateSchema = z.object({
  gameTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .default("00:00:00"),
  gameDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .default("0000-01-01"),
  weekDay: z.string().min(1).max(32).default("Monday"),
});

const DEFAULT_STATE = {
  gameTime: "00:00:00",
  gameDate: "0000-01-01",
  weekDay: "Monday",
} as const;

type SessionCtx = {
  session: {
    user?: {
      id?: string;
    };
  } | null;
};

const getUserId = (ctx: SessionCtx) => {
  const userId = ctx.session?.user?.id;

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return userId;
};

export const gameClockRouter = createTRPCRouter({
  getState: protectedProcedure.query(async ({ ctx }) => {
    const userId = getUserId(ctx);

    const state = await ctx.db.gameClockState.findUnique({
      where: { userId },
      select: {
        gameTime: true,
        gameDate: true,
        weekDay: true,
      },
    });

    return state ?? { ...DEFAULT_STATE };
  }),
  saveState: protectedProcedure
    .input(stateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const result = await ctx.db.gameClockState.upsert({
        where: { userId },
        create: {
          userId,
          ...input,
        },
        update: {
          ...input,
        },
        select: {
          gameTime: true,
          gameDate: true,
          weekDay: true,
        },
      });

      return result;
    }),
});
