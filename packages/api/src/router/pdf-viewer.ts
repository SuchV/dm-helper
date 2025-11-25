import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const tabSelect = {
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
  bookmarks: {
    select: {
      id: true,
      label: true,
      pageNumber: true,
      note: true,
      chapterLabel: true,
      createdAt: true,
    },
    orderBy: { pageNumber: "asc" as const },
  },
};

const mapTab = (
  tab: {
    id: string;
    title: string;
    storageKey: string;
    pinned: boolean;
    pinnedAt: Date | null;
    isOpen: boolean;
    isActive: boolean;
    lastOpenedAt: Date;
    currentPage: number;
    totalPages: number | null;
    bookmarks: Array<{
      id: string;
      label: string;
      pageNumber: number;
      note: string | null;
      chapterLabel: string | null;
      createdAt: Date;
    }>;
  },
) => {
  return {
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
      note: bookmark.note,
      chapterLabel: bookmark.chapterLabel,
      createdAt: bookmark.createdAt.toISOString(),
    })),
  };
};

export const pdfViewerRouter = createTRPCRouter({
  createTab: protectedProcedure
    .input(
      z.object({
        widgetId: z.string().cuid(),
        title: z.string().min(1).max(200),
        storageKey: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const widget = await ctx.db.widgetInstance.findFirst({
        where: { id: input.widgetId, userId, type: "pdf-viewer" },
        select: { id: true },
      });

      if (!widget) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.pdfDocumentTab.updateMany({
        where: { userId, widgetId: widget.id },
        data: { isActive: false },
      });

      const created = await ctx.db.pdfDocumentTab.create({
        data: {
          userId,
          widgetId: widget.id,
          title: input.title,
          storageKey: input.storageKey,
          isOpen: true,
          isActive: true,
          lastOpenedAt: new Date(),
        },
        select: tabSelect,
      });

      return mapTab(created);
    }),
  setActiveTab: protectedProcedure
    .input(
      z.object({
        widgetId: z.string().cuid(),
        tabId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const tab = await ctx.db.pdfDocumentTab.findFirst({
        where: { id: input.tabId, userId, widgetId: input.widgetId },
        select: { id: true, widgetId: true },
      });

      if (!tab) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.$transaction([
        ctx.db.pdfDocumentTab.updateMany({
          where: { userId, widgetId: tab.widgetId },
          data: { isActive: false },
        }),
        ctx.db.pdfDocumentTab.update({
          where: { id: tab.id },
          data: { isActive: true, isOpen: true, lastOpenedAt: new Date() },
        }),
      ]);

      return { success: true } as const;
    }),
  updatePage: protectedProcedure
    .input(
      z.object({
        tabId: z.string().cuid(),
        currentPage: z.number().int().min(1),
        totalPages: z.number().int().min(1).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const tab = await ctx.db.pdfDocumentTab.findFirst({
        where: { id: input.tabId, userId },
        select: { id: true },
      });

      if (!tab) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.pdfDocumentTab.update({
        where: { id: tab.id },
        data: {
          currentPage: input.currentPage,
          totalPages: input.totalPages ?? undefined,
          lastOpenedAt: new Date(),
        },
      });

      return { success: true } as const;
    }),
  pinTab: protectedProcedure
    .input(
      z.object({ tabId: z.string().cuid(), pinned: z.boolean() }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const tab = await ctx.db.pdfDocumentTab.findFirst({
        where: { id: input.tabId, userId },
        select: { id: true },
      });

      if (!tab) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updated = await ctx.db.pdfDocumentTab.update({
        where: { id: tab.id },
        data: {
          pinned: input.pinned,
          pinnedAt: input.pinned ? new Date() : null,
        },
        select: tabSelect,
      });

      return mapTab(updated);
    }),
  closeTab: protectedProcedure
    .input(z.object({ tabId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const tab = await ctx.db.pdfDocumentTab.findFirst({
        where: { id: input.tabId, userId },
        select: { id: true },
      });

      if (!tab) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updated = await ctx.db.pdfDocumentTab.update({
        where: { id: tab.id },
        data: {
          isOpen: false,
          isActive: false,
          lastOpenedAt: new Date(),
        },
        select: tabSelect,
      });

      return mapTab(updated);
    }),
  reopenTab: protectedProcedure
    .input(z.object({ tabId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const tab = await ctx.db.pdfDocumentTab.findFirst({
        where: { id: input.tabId, userId },
        select: { id: true },
      });

      if (!tab) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updated = await ctx.db.pdfDocumentTab.update({
        where: { id: tab.id },
        data: {
          isOpen: true,
          lastOpenedAt: new Date(),
        },
        select: tabSelect,
      });

      return mapTab(updated);
    }),
  addBookmark: protectedProcedure
    .input(z.object({
      tabId: z.string().cuid(),
      pageNumber: z.number().int().min(1),
      label: z.string().min(1).max(200).optional(),
      note: z.string().max(1000).optional(),
      chapterLabel: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const tab = await ctx.db.pdfDocumentTab.findFirst({
        where: { id: input.tabId, userId },
        select: { id: true },
      });

      if (!tab) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const bookmark = await ctx.db.pdfBookmark.create({
        data: {
          userId,
          tabId: tab.id,
          pageNumber: input.pageNumber,
          label: input.label ?? `Page ${input.pageNumber}`,
          note: input.note ?? null,
          chapterLabel: input.chapterLabel ?? null,
        },
        select: {
          id: true,
          label: true,
          pageNumber: true,
          note: true,
          chapterLabel: true,
          createdAt: true,
          tabId: true,
        },
      });

      await ctx.db.pdfDocumentTab.update({
        where: { id: tab.id },
        data: { currentPage: input.pageNumber },
      });

      return {
        id: bookmark.id,
        label: bookmark.label,
        pageNumber: bookmark.pageNumber,
        note: bookmark.note,
        chapterLabel: bookmark.chapterLabel,
        createdAt: bookmark.createdAt.toISOString(),
      };
    }),
  removeBookmark: protectedProcedure
    .input(z.object({ bookmarkId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      const bookmark = await ctx.db.pdfBookmark.findFirst({
        where: { id: input.bookmarkId, userId },
        select: { id: true },
      });

      if (!bookmark) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.pdfBookmark.delete({ where: { id: bookmark.id } });

      return { success: true } as const;
    }),
});
