import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const widgetStateInput = z.object({
  widgetIdsByType: z.object({
    "game-clock": z.array(z.string().cuid()).optional(),
    notes: z.array(z.string().cuid()).optional(),
  }),
});

const emptyResponse = {
  "game-clock": {} as Record<
    string,
    {
      gameTime: string;
      gameDate: string;
      weekDay: string;
    }
  >,
  notes: {} as Record<
    string,
    {
      notes: Array<{
        id: string;
        title: string;
        content: string;
        position: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }
  >,
};

export const widgetStateRouter = createTRPCRouter({
  bulk: protectedProcedure.input(widgetStateInput).query(async ({ ctx, input }) => {
    const userId = getUserId(ctx);
    const response = {
      "game-clock": { ...emptyResponse["game-clock"] },
      notes: { ...emptyResponse["notes"] },
    };

    const gameClockIds = input.widgetIdsByType["game-clock"] ?? [];
    const notesWidgetIds = input.widgetIdsByType.notes ?? [];

    if (gameClockIds.length > 0) {
      const states = await ctx.db.gameClockState.findMany({
        where: {
          userId,
          widgetId: { in: gameClockIds },
        },
        select: {
          widgetId: true,
          gameTime: true,
          gameDate: true,
          weekDay: true,
        },
      });

      for (const state of states) {
        if (!state.widgetId) continue;
        response["game-clock"][state.widgetId] = {
          gameTime: state.gameTime,
          gameDate: state.gameDate,
          weekDay: state.weekDay,
        };
      }
    }

    if (notesWidgetIds.length > 0) {
      for (const widgetId of notesWidgetIds) {
        response.notes[widgetId] = { notes: [] };
      }

      const notes = await ctx.db.gameNote.findMany({
        where: {
          userId,
          widgetId: { in: notesWidgetIds },
        },
        orderBy: { position: "asc" },
        select: {
          id: true,
          widgetId: true,
          title: true,
          content: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      for (const note of notes) {
        if (!note.widgetId) continue;
        const bucket =
          response.notes[note.widgetId] ??
          (response.notes[note.widgetId] = { notes: [] });
        bucket.notes.push({
          id: note.id,
          title: note.title,
          content: note.content,
          position: note.position,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        });
      }
    }

    return response;
  }),
});
