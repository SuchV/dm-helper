import { prisma } from "@spolka-z-l-o/db";
import { discord, mock } from "@spolka-z-l-o/discord";
import { CDNRoutes, ImageFormat, RouteBases } from "@spolka-z-l-o/validators";

export const upsertUser = async (
  ctx: { discord: discord.DiscordAPIClient | mock.DiscordAPIClientMock },
  guildId: string,
  providerAccountId: string,
) => {
  // Fetch member from discord api
  const member = await ctx.discord.getGuildMember({
    guildId,
    userId: providerAccountId,
  });

  const memberAvatar = member?.user.avatar
    ? RouteBases.cdn +
      CDNRoutes.userAvatar(
        providerAccountId,
        member.user.avatar,
        ImageFormat.PNG,
      )
    : null;

  const memberName = member?.nick ?? member?.user.username;

  // Upsert the user & account in the database
  await prisma.account.upsert({
    where: {
      providerAccountId: providerAccountId,
    },
    update: {},
    create: {
      providerAccountId: providerAccountId,
      type: "none",
      provider: "none",
      user: {
        // Account does not exist without user, but fallback just in case
        connectOrCreate: {
          where: { id: providerAccountId },
          create: {
            name: memberName,
            image: memberAvatar,
            email: member?.user.email ?? member?.user.username + "@example.com", // Fallback email if not provided
          },
        },
      },
    },
  });
};
