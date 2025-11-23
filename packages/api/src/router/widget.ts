import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const widgetTypeSchema = z.enum(["game-clock", "notes", "dice-roller", "pdf-viewer"]);

const widgetSelect = {
  id: true,
  type: true,
  collapsed: true,
  position: true,
  config: true,
  gameClockState: {
    select: {
      gameTime: true,
      gameDate: true,
      weekDay: true,
    },
  },
  notes: {
    select: {
      id: true,
      title: true,
      content: true,
      position: true,
      pinned: true,
      pinnedAt: true,
      createdAt: true,
      updatedAt: true,
      widgetId: true,
    },
    orderBy: [
      { pinned: "desc" },
      { pinnedAt: "desc" },
      { position: "asc" },
    ],
  },
  pdfTabs: {
    select: {
      id: true,
      title: true,
      storageKey: true,
      pinned: true,
      pinnedAt: true,
      isOpen: true,
      isActive: true,
      lastOpenedAt: true,
      currentPage: true,
      totalPages: true,
      createdAt: true,
      updatedAt: true,
      bookmarks: {
        select: {
          id: true,
          label: true,
          pageNumber: true,
          createdAt: true,
        },
        orderBy: { pageNumber: "asc" },
      },
    },
    orderBy: [
      { pinned: "desc" },
      { isOpen: "desc" },
      { lastOpenedAt: "desc" },
    ],
  },
};

export const widgetRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = getUserId(ctx);

      return ctx.db.widgetInstance.findMany({
        where: { userId },
        orderBy: { position: "asc" },
        select: widgetSelect as never,
      });
  }),
  add: protectedProcedure
    .input(z.object({ type: widgetTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      if (input.type === "notes") {
        const existingNotesWidget = await ctx.db.widgetInstance.findFirst({
          where: { userId, type: "notes" },
          select: { id: true },
        });

        if (existingNotesWidget) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can only add one Notes widget",
          });
        }
      }

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
        select: widgetSelect as never,
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

      await ctx.db.gameNote.deleteMany({
        where: {
          userId,
          widgetId: widget.id,
        },
      });

      await ctx.db.pdfBookmark.deleteMany({
        where: {
          userId,
          tab: {
            widgetId: widget.id,
          },
        },
      });

      await ctx.db.pdfDocumentTab.deleteMany({
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
        select: widgetSelect as never,
      });
    }),
});
