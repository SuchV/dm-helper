import type { Prisma } from "@prisma/client";
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
} satisfies Prisma.WidgetInstanceSelect;

export type WidgetInstanceWithState = Prisma.WidgetInstanceGetPayload<{
  select: typeof widgetSelect;
}>;

export type WidgetIdsByType = {
  "game-clock": string[];
};

export type GameClockWidgetState = Pick<GameClockState, "gameTime" | "gameDate" | "weekDay">;

export type WidgetStateBundle = {
  "game-clock": Record<string, GameClockWidgetState>;
};

export const createEmptyWidgetStateBundle = (): WidgetStateBundle => ({
  "game-clock": {},
});
