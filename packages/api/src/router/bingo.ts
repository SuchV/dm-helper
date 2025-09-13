import { z } from "zod";

import prisma from "@spolka-z-l-o/db";
import {
  CreateBingoForm,
  createBingoFormSchema,
} from "@spolka-z-l-o/validators";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const bingoRouter = createTRPCRouter({
  getBingos: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.bingo.findMany({
        where: {
          guildId: input.guildId,
        },
      });
    }),
  getBingo: protectedProcedure
    .input(z.object({ bingoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.bingo.findUnique({
        include: {
          bingoEntries: {
            include: {
              user: true,
            },
          },
        },
        where: {
          id: input.bingoId,
        },
      });
    }),
  createBingo: protectedProcedure
    .input(createBingoFormSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bingo.create({
        data: {
          name: input.name,
          guildId: input.guildId,
          channelId: "", // <-- Provide appropriate value
          messageId: "", // <-- Provide appropriate value
          dimension: 5, // <-- Provide appropriate value (e.g., 5 for a 5x5 bingo)
          bingoEntries: {
            create: input.entries.map((entry: string) => ({
              entry,
            })),
          },
        },
      });
    }),
  createBingoEntry: protectedProcedure
    .input(z.object({ bingoId: z.string(), entry: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bingoEntry.create({
        data: {
          bingoId: input.bingoId,
          entry: input.entry,
        },
      });
    }),
  updateBingoEntry: protectedProcedure
    .input(
      z.object({ id: z.string(), isCompleted: z.boolean(), entry: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Updating bingo entry", input);
      return await ctx.db.bingoEntry.update({
        where: {
          id: input.id,
        },
        data: {
          userId: input.isCompleted ? ctx.session?.user?.id : null,
          entry: input.entry,
        },
      });
    }),
  deleteBingoEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bingoEntry.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
