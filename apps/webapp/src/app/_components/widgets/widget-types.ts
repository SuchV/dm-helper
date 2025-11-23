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
};

export type WidgetInstanceWithState = Prisma.WidgetInstanceGetPayload<{
  select: typeof widgetSelect;
}>;

export interface WidgetIdsByType {
  "game-clock": string[];
  notes: string[];
  "dice-roller": string[];
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

export interface WidgetStateBundle {
  "game-clock": Record<string, GameClockWidgetState>;
  notes: Record<string, NotesWidgetState>;
  "dice-roller": Record<string, DiceRollerWidgetState>;
}

export const createEmptyWidgetStateBundle = (): WidgetStateBundle => ({
  "game-clock": {},
  notes: {},
  "dice-roller": {},
});
