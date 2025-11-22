import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const widgetStateInput = z.object({
  widgetIdsByType: z.object({
    "game-clock": z.array(z.string().cuid()).optional(),
    notes: z.array(z.string().cuid()).optional(),
    "dice-roller": z.array(z.string().cuid()).optional(),
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
        pinned: boolean;
        pinnedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
    }
  >,
  "dice-roller": {} as Record<
    string,
    {
      logs: Array<{
        id: string;
        modifier: number;
        total: number;
        results: Array<{ sides: number; value: number }>;
        createdAt: string;
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
      "dice-roller": { ...emptyResponse["dice-roller"] },
    };

    const gameClockIds = input.widgetIdsByType["game-clock"] ?? [];
    const notesWidgetIds = input.widgetIdsByType.notes ?? [];
    const diceRollerIds = input.widgetIdsByType["dice-roller"] ?? [];

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

      const notes = ((await ctx.db.gameNote.findMany({
        where: {
          userId,
          widgetId: { in: notesWidgetIds },
        },
        orderBy: [
          { pinned: "desc" },
          { pinnedAt: "desc" },
          { position: "asc" },
        ],
        select: {
          id: true,
          widgetId: true,
          title: true,
          content: true,
          position: true,
          pinned: true,
          pinnedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as Array<{
        id: string;
        widgetId: string;
        title: string;
        content: string;
        position: number;
        pinned: boolean;
        pinnedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
      }>)

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
          pinned: note.pinned,
          pinnedAt: note.pinnedAt?.toISOString() ?? null,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        });
      }
    }

    if (diceRollerIds.length > 0) {
      for (const widgetId of diceRollerIds) {
        response["dice-roller"][widgetId] = { logs: [] };
      }

      const logs = await ctx.db.diceRollLog.findMany({
        where: {
          userId,
          widgetId: { in: diceRollerIds },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          widgetId: true,
          modifier: true,
          total: true,
          results: true,
          createdAt: true,
        },
      });

      for (const log of logs) {
        const bucket =
          response["dice-roller"][log.widgetId] ??
          (response["dice-roller"][log.widgetId] = { logs: [] });
        bucket.logs.push({
          id: log.id,
          modifier: log.modifier,
          total: log.total,
          results: (log.results as { sides: number; value: number }[]) ?? [],
          createdAt: log.createdAt.toISOString(),
        });
      }
    }

    return response;
  }),
});
