import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const noteSelect = {
  id: true,
  widgetId: true,
  title: true,
  content: true,
  position: true,
  createdAt: true,
  updatedAt: true,
} as const;

const normalizeTitle = (title?: string) => {
  if (title === undefined) {
    return undefined;
  }

  const trimmed = title.trim();

  return trimmed.length > 0 ? trimmed : "Untitled note";
};

const ensureWidgetOwnership = async (
  db: { widgetInstance: { findFirst: any } },
  userId: string,
  widgetId: string,
) => {
  const widget = await db.widgetInstance.findFirst({
    where: { id: widgetId, userId },
    select: { id: true },
  });

  if (!widget) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Widget not found" });
  }
};

export const noteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        widgetId: z.string().cuid(),
        title: z.string().max(80).optional(),
        content: z.string().max(8000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      await ensureWidgetOwnership(ctx.db, userId, input.widgetId);

      const lastNote = await ctx.db.gameNote.findFirst({
        where: { widgetId: input.widgetId, userId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const nextPosition = lastNote ? lastNote.position + 1 : 0;

      const note = await ctx.db.gameNote.create({
        data: {
          userId,
          widgetId: input.widgetId,
          title: normalizeTitle(input.title) ?? "Untitled note",
          content: input.content ?? "",
          position: nextPosition,
        },
        select: noteSelect,
      });

      return note;
    }),
  update: protectedProcedure
    .input(
      z.object({
        noteId: z.string().cuid(),
        title: z.string().max(80).optional(),
        content: z.string().max(8000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const note = await ctx.db.gameNote.findFirst({
        where: { id: input.noteId, userId },
        select: { id: true },
      });

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updated = await ctx.db.gameNote.update({
        where: { id: note.id },
        data: {
          title: normalizeTitle(input.title),
          content: input.content ?? undefined,
        },
        select: noteSelect,
      });

      return updated;
    }),
  remove: protectedProcedure
    .input(z.object({ noteId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const note = await ctx.db.gameNote.findFirst({
        where: { id: input.noteId, userId },
        select: { id: true, widgetId: true },
      });

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.gameNote.delete({ where: { id: note.id } });

      const remaining = await ctx.db.gameNote.findMany({
        where: { widgetId: note.widgetId, userId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      await Promise.all(
        remaining.map((item, index) =>
          ctx.db.gameNote.update({
            where: { id: item.id },
            data: { position: index },
          }),
        ),
      );

      return { success: true } as const;
    }),
});
