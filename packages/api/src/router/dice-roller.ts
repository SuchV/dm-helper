import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const rollResultSchema = z.object({
  sides: z.number().int().positive(),
  value: z.number().int().nonnegative(),
});

export const diceRollerRouter = createTRPCRouter({
  logRoll: protectedProcedure
    .input(
      z.object({
        widgetId: z.string().cuid(),
        modifier: z.number().int(),
        total: z.number().int(),
        results: z.array(rollResultSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const widget = await ctx.db.widgetInstance.findFirst({
        where: { id: input.widgetId, userId },
        select: { id: true },
      });

      if (!widget) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const log = await ctx.db.diceRollLog.create({
        data: {
          userId,
          widgetId: input.widgetId,
          modifier: input.modifier,
          total: input.total,
          results: input.results,
        },
        select: {
          id: true,
          modifier: true,
          total: true,
          results: true,
          createdAt: true,
        },
      });

      return {
        id: log.id,
        modifier: log.modifier,
        total: log.total,
        results: log.results as { sides: number; value: number }[],
        createdAt: log.createdAt.toISOString(),
      };
    }),
  clearLogs: protectedProcedure
    .input(z.object({ widgetId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const widget = await ctx.db.widgetInstance.findFirst({
        where: { id: input.widgetId, userId },
        select: { id: true },
      });

      if (!widget) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.diceRollLog.deleteMany({
        where: {
          userId,
          widgetId: input.widgetId,
        },
      });

      return { success: true } as const;
    }),
});
