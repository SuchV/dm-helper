import * as discord from "@spolka-z-l-o/discord";

import type { APIGuildMember } from "discord-api-types/v10";

export type DiscordUserGuild = Awaited<
  ReturnType<discord.DiscordAPIClient["getUserGuilds"]>
>[number];

export type DiscordBotGuild = Awaited<
  ReturnType<discord.DiscordAPIClient["getBotGuilds"]>
>[number];

export type DiscordGuildMemberWithBirthday = APIGuildMember & {
  birthday?: Date | null;
};

export type {
  APIGuildMember,
  UserAvatarFormat,
  APIGuildChannel,
} from "discord-api-types/v10";

export {
  RouteBases,
  CDNRoutes,
  ImageFormat,
  ChannelType,
} from "discord-api-types/v10";
