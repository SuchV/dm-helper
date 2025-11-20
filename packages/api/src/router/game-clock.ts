import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

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
  widgetId: z.string().cuid(),
});

const DEFAULT_STATE = {
  gameTime: "00:00:00",
  gameDate: "0000-01-01",
  weekDay: "Monday",
} as const;

export const gameClockRouter = createTRPCRouter({
  getState: protectedProcedure
    .input(z.object({ widgetId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const userId = getUserId(ctx);
      const widgetId = input.widgetId;

      const state = await ctx.db.gameClockState.findFirst({
        where: { userId, widgetId },
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
      const { widgetId, ...stateInput } = input;

      const widget = await ctx.db.widgetInstance.findFirst({
        where: { id: widgetId, userId },
        select: { id: true },
      });

      if (!widget) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const result = await ctx.db.gameClockState.upsert({
        where: {
          userId_widgetId: {
            userId,
            widgetId,
          },
        },
        create: {
          userId,
          widgetId,
          ...stateInput,
        },
        update: {
          ...stateInput,
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
