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
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      position: "asc",
    },
  },
} satisfies Prisma.WidgetInstanceSelect;

export type WidgetInstanceWithState = Prisma.WidgetInstanceGetPayload<{
  select: typeof widgetSelect;
}>;

export type WidgetIdsByType = {
  "game-clock": string[];
  notes: string[];
};

export type GameClockWidgetState = Pick<GameClockState, "gameTime" | "gameDate" | "weekDay">;

export type NotesWidgetNote = {
  id: string;
  title: string;
  content: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type NotesWidgetState = {
  notes: NotesWidgetNote[];
};

export type WidgetStateBundle = {
  "game-clock": Record<string, GameClockWidgetState>;
  notes: Record<string, NotesWidgetState>;
};

export const createEmptyWidgetStateBundle = (): WidgetStateBundle => ({
  "game-clock": {},
  notes: {},
});
