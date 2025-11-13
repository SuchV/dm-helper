import { z } from "zod";
import { set } from "zod/v4";

import { prisma } from "@repo/db";

import { upsertUser } from "../helpers/user";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const birthdayRouter = createTRPCRouter({
  getGuildBirthdays: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.guildId) {
        throw new Error("Guild ID is required.");
      }

      const result = await prisma.birthday.findMany({
        where: {
          guildId: input.guildId,
        },
        orderBy: {
          birthday_date: "asc",
        },
        include: {
          account: {
            select: {
              providerAccountId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new Error("No birthdays found for this guild.");
      }

      return result;
    }),
  setGuildMemberBirthday: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
        providerAccountId: z.string(),
        birthdayDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { guildId, providerAccountId, birthdayDate } = input;

      // Ensure the user & account exists
      await upsertUser(ctx, guildId, providerAccountId);

      const newBirthday = await prisma.birthday.upsert({
        where: {
          providerAccountId_guildId: {
            providerAccountId,
            guildId,
          },
        },
        update: {
          birthday_date: birthdayDate,
        },
        create: {
          providerAccountId,
          guildId,
          birthday_date: birthdayDate,
        },
      });

      return newBirthday;
    }),
});
