import { z } from "zod";

import { prisma } from "@spolka-z-l-o/db";
import { guildArray } from "@spolka-z-l-o/discord/mocks/guilds";
import { env } from "@spolka-z-l-o/env/next-env";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const discordRouter = createTRPCRouter({
  getDashboardGuilds: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new Error("Session not defined.");
    }

    const result = await prisma.account.findFirst({
      where: {
        userId: ctx.session.user?.id,
      },
      select: {
        access_token: true,
      },
    });

    if (!result || !result.access_token) {
      throw new Error("No access token found for user.");
    }

    // Fetch the user's guilds using the access token
    const userGuilds = await ctx.discord.getUserGuilds(result.access_token);
    const botGuilds = await ctx.discord.getBotGuilds();

    const commonGuilds = userGuilds.filter((guild) =>
      botGuilds.some((botGuild) => botGuild.id === guild.id),
    );
    const otherGuilds = userGuilds.filter(
      (guild) =>
        !commonGuilds.some((commonGuild) => commonGuild.id === guild.id),
    );

    return {
      commonGuilds,
      otherGuilds,
    };
  }),
  getGuildDetails: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ ctx, input }) => {
      const guildDetails = await ctx.discord.getGuildDetails(input.guildId);
      if (!guildDetails) {
        throw new Error("Guild not found.");
      }

      return guildDetails;
    }),
  getGuildMembers: protectedProcedure
    .input(z.object({ guildId: z.string(), withBot: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.guildId) {
        throw new Error("Guild ID is required.");
      }

      return ctx.discord.getGuildMembers(input.guildId, input.withBot ?? true);
    }),
  getGuildMembersWithBirthday: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.guildId) {
        throw new Error("Guild ID is required.");
      }

      const members = await ctx.discord.getGuildMembers(input.guildId, false);
      const birthdays = await prisma.birthday.findMany({
        where: {
          guildId: input.guildId,
        },
        select: {
          providerAccountId: true,
          birthday_date: true,
        },
      });

      return members.map((member) => {
        const birthday = birthdays.find(
          (b) => b.providerAccountId === member.user.id,
        );
        return {
          ...member,
          birthday: birthday ? birthday.birthday_date : null,
        };
      });
    }),
});
