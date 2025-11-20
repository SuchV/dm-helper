import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserId } from "./_helpers/get-user-id";

const widgetStateInput = z.object({
  widgetIdsByType: z.object({
    "game-clock": z.array(z.string().cuid()).optional(),
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
};

export const widgetStateRouter = createTRPCRouter({
  bulk: protectedProcedure.input(widgetStateInput).query(async ({ ctx, input }) => {
    const userId = getUserId(ctx);
    const response = {
      "game-clock": { ...emptyResponse["game-clock"] },
    };

    const gameClockIds = input.widgetIdsByType["game-clock"] ?? [];

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

    return response;
  }),
});
