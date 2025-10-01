import { count } from "console";
import {
  APIGuild,
  PermissionFlagsBits,
  OAuth2Routes,
  Routes,
  RouteBases,
  APIGuildMember,
} from "discord-api-types/v10";

export class DiscordAPIClient {
  private _token: string;

  constructor(token: string) {
    this._token = token;
  }

  public async getUserGuilds(
    user_access_token: string,
    permissions: bigint = PermissionFlagsBits.Administrator
  ) {
    const userGuildResponse = await fetch(
      `${RouteBases.api + Routes.userGuilds()}?${new URLSearchParams({
        with_counts: "true",
      })}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user_access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userGuildResponse.ok) {
      throw new Error(
        `Failed to fetch guilds for user: ${userGuildResponse.statusText}`
      );
    }

    return (await (userGuildResponse.json() as Promise<APIGuild[]>)).filter(
      (guild) => {
        return guild.permissions && BigInt(guild.permissions) & permissions;
      }
    );
  }

  public async getBotGuilds() {
    const botGuildResponse = await fetch(
      `${RouteBases.api + Routes.userGuilds()}?${new URLSearchParams({
        with_counts: "true",
      })}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this._token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!botGuildResponse.ok) {
      throw new Error(
        `Failed to fetch guilds for bot: ${botGuildResponse.statusText}`
      );
    }

    return (await botGuildResponse.json()) as APIGuild[];
  }

  public async getGuildDetails(guildId: string): Promise<APIGuild> {
    const response = await fetch(
      `${RouteBases.api + Routes.guild(guildId)}?${new URLSearchParams({
        limit: "1000",
        with_counts: "true",
      })}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this._token}`,
          "Content-Type": "application/json",
          Cache: "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch guild details for ${guildId}`);
    }

    return (await response.json()) as APIGuild;
  }

  public async getGuildMembers(
    guildId: string,
    includeBots: boolean
  ): Promise<APIGuildMember[]> {
    const response = await fetch(
      `${RouteBases.api + Routes.guildMembers(guildId)}?${new URLSearchParams({
        limit: "1000",
        with_counts: "true",
      })}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this._token}`,
          "Content-Type": "application/json",
          Cache: "",
        },
      }
    );

    console.log({ response });

    if (!response.ok) {
      throw new Error(`Failed to fetch members for guild ${guildId}`);
    }

    return ((await response.json()) as APIGuildMember[]).filter((member) => {
      // Filter out bots if includeBots is false
      return includeBots || !member.user.bot;
    });
  }

  public async getGuildMember({
    guildId,
    userId,
  }: {
    guildId: string;
    userId: string;
  }): Promise<APIGuildMember | null> {
    const response = await fetch(
      `${RouteBases.api + Routes.guildMember(guildId, userId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this._token}`,
          "Content-Type": "application/json",
          Cache: "",
        },
      }
    );

    if (response.status === 404) {
      return null; // Member not found
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch member ${userId} in guild ${guildId}`);
    }

    return (await response.json()) as APIGuildMember;
  }
}
