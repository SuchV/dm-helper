import type { Prisma } from "@repo/db";
import type { GameClockState } from "@repo/ui/game-clock";

export const widgetSelect = {
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
    },
    orderBy: [
      { pinned: "desc" as const },
      { pinnedAt: "desc" as const },
      { position: "asc" as const },
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
        orderBy: { pageNumber: "asc" as const },
      },
    },
    orderBy: [
      { pinned: "desc" as const },
      { isOpen: "desc" as const },
      { lastOpenedAt: "desc" as const },
    ],
  },
};

export type WidgetInstanceWithState = Prisma.WidgetInstanceGetPayload<{
  select: typeof widgetSelect;
}>;

export interface WidgetIdsByType {
  "game-clock": string[];
  notes: string[];
  "dice-roller": string[];
  "pdf-viewer": string[];
}

export type WidgetNoteRecord = WidgetInstanceWithState["notes"][number];

export type GameClockWidgetState = Pick<GameClockState, "gameTime" | "gameDate" | "weekDay">;

export interface NotesWidgetNote {
  id: string;
  title: string;
  content: string;
  position: number;
  pinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotesWidgetState {
  notes: NotesWidgetNote[];
}

export interface DiceRollLogEntry {
  id: string;
  modifier: number;
  total: number;
  results: { sides: number; value: number }[];
  createdAt: string;
}

export interface DiceRollerWidgetState {
  logs: DiceRollLogEntry[];
}

export interface PdfViewerBookmarkState {
  id: string;
  label: string;
  pageNumber: number;
  createdAt: string;
}

export interface PdfViewerTabState {
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
  bookmarks: PdfViewerBookmarkState[];
}

export interface PdfViewerWidgetState {
  tabs: PdfViewerTabState[];
  activeTabId: string | null;
}

export interface WidgetStateBundle {
  "game-clock": Record<string, GameClockWidgetState>;
  notes: Record<string, NotesWidgetState>;
  "dice-roller": Record<string, DiceRollerWidgetState>;
  "pdf-viewer": Record<string, PdfViewerWidgetState>;
}

export const createEmptyWidgetStateBundle = (): WidgetStateBundle => ({
  "game-clock": {},
  notes: {},
  "dice-roller": {},
  "pdf-viewer": {},
});
