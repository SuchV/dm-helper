import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const widgetTypeSchema = z.enum(["game-clock"]);

const widgetSelect = {
  id: true,
  type: true,
  collapsed: true,
  position: true,
  config: true,
} as const;

const getUserId = (ctx: {
  session: {
    user?: {
      id?: string;
    };
  } | null;
}) => {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return userId;
};

export const widgetRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = getUserId(ctx);

    return ctx.db.widgetInstance.findMany({
      where: { userId },
      orderBy: { position: "asc" },
      select: widgetSelect,
    });
  }),
  add: protectedProcedure
    .input(z.object({ type: widgetTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);
      const lastWidget = await ctx.db.widgetInstance.findFirst({
        where: { userId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const nextPosition = lastWidget ? lastWidget.position + 1 : 0;

      return ctx.db.widgetInstance.create({
        data: {
          userId,
          type: input.type,
          position: nextPosition,
        },
        select: widgetSelect,
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);
      const widget = await ctx.db.widgetInstance.findFirst({
        where: { id: input.id, userId },
        select: { id: true },
      });

      if (!widget) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.widgetInstance.delete({ where: { id: widget.id } });

      await ctx.db.gameClockState.deleteMany({
        where: {
          userId,
          widgetId: widget.id,
        },
      });

      const remaining = await ctx.db.widgetInstance.findMany({
        where: { userId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      await Promise.all(
        remaining.map((item, index) =>
          ctx.db.widgetInstance.update({
            where: { id: item.id },
            data: { position: index },
          }),
        ),
      );

      return { success: true } as const;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        collapsed: z.boolean().optional(),
        position: z.number().int().optional(),
        config: z.unknown().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);
      const widget = await ctx.db.widgetInstance.findFirst({
        where: { id: input.id, userId },
        select: { id: true },
      });

      if (!widget) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.widgetInstance.update({
        where: { id: widget.id },
        data: {
          collapsed: input.collapsed ?? undefined,
          position: input.position ?? undefined,
          config: input.config ?? undefined,
        },
        select: widgetSelect,
      });
    }),
});
