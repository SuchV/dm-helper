import { DiscordAPIClient } from "@repo/discord/src/discord";

import type { APIGuildMember } from "discord-api-types/v10";

export type DiscordUserGuild = Awaited<
  ReturnType<DiscordAPIClient["getUserGuilds"]>
>[number];

export type DiscordBotGuild = Awaited<
  ReturnType<DiscordAPIClient["getBotGuilds"]>
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
