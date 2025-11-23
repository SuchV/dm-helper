import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const widgetStateInput = z.object({
  widgetIdsByType: z.object({
    "game-clock": z.array(z.string().cuid()).optional(),
    notes: z.array(z.string().cuid()).optional(),
    "dice-roller": z.array(z.string().cuid()).optional(),
    "pdf-viewer": z.array(z.string().cuid()).optional(),
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
  "pdf-viewer": {} as Record<
    string,
    {
      tabs: Array<{
        id: string;
        title: string;
        storageKey: string;
        pinned: boolean;
        pinnedAt: string | null;
        isOpen: boolean;
        isActive: boolean;
        lastOpenedAt: string;
        currentPage: number;
        totalPages: number | null;
        bookmarks: Array<{
          id: string;
          label: string;
          pageNumber: number;
          createdAt: string;
        }>;
      }>;
      activeTabId: string | null;
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
      "pdf-viewer": { ...emptyResponse["pdf-viewer"] },
    };

    const gameClockIds = input.widgetIdsByType["game-clock"] ?? [];
    const notesWidgetIds = input.widgetIdsByType.notes ?? [];
    const diceRollerIds = input.widgetIdsByType["dice-roller"] ?? [];
    const pdfViewerIds = input.widgetIdsByType["pdf-viewer"] ?? [];

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

    if (pdfViewerIds.length > 0) {
      for (const widgetId of pdfViewerIds) {
        response["pdf-viewer"][widgetId] = { tabs: [], activeTabId: null };
      }

      const tabs = await ctx.db.pdfDocumentTab.findMany({
        where: {
          userId,
          widgetId: { in: pdfViewerIds },
        },
        orderBy: [
          { pinned: "desc" },
          { isOpen: "desc" },
          { lastOpenedAt: "desc" },
        ],
        select: {
          id: true,
          widgetId: true,
          title: true,
          storageKey: true,
          pinned: true,
          pinnedAt: true,
          isOpen: true,
          isActive: true,
          lastOpenedAt: true,
          currentPage: true,
          totalPages: true,
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
      });

      for (const tab of tabs) {
        const bucket = response["pdf-viewer"][tab.widgetId];
        if (!bucket) continue;
        const mapped = {
          id: tab.id,
          title: tab.title,
          storageKey: tab.storageKey,
          pinned: tab.pinned,
          pinnedAt: tab.pinnedAt?.toISOString() ?? null,
          isOpen: tab.isOpen,
          isActive: tab.isActive,
          lastOpenedAt: tab.lastOpenedAt.toISOString(),
          currentPage: tab.currentPage,
          totalPages: tab.totalPages,
          bookmarks: tab.bookmarks.map((bookmark) => ({
            id: bookmark.id,
            label: bookmark.label,
            pageNumber: bookmark.pageNumber,
            createdAt: bookmark.createdAt.toISOString(),
          })),
        };
        bucket.tabs.push(mapped);
        if (mapped.isActive) {
          bucket.activeTabId = mapped.id;
        }
      }

      for (const widgetId of pdfViewerIds) {
        const bucket = response["pdf-viewer"][widgetId];
        if (!bucket) continue;
        if (!bucket.activeTabId) {
          bucket.activeTabId = bucket.tabs.find((tab) => tab.isOpen)?.id ?? null;
        }
        bucket.tabs = bucket.tabs.map((tab) => ({
          ...tab,
          isActive: bucket.activeTabId === tab.id,
        }));
      }
    }

    return response;
  }),
});
