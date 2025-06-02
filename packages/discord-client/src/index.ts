import { env } from "@spolka-z-l-o/env/next-env";
import { Client, PermissionFlagsBits } from "discord.js";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  cachedClient: DiscordClient;
}

export class DiscordClient {
  private client: Client;

  constructor(token: string = env.DISCORD_CLIENT_TOKEN) {
    this.client = new Client({
      intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildMembers"],
    });
    this.client.login(token);
  }

  getClient(): Client {
    return this.client;
  }

  async logout(): Promise<void> {
    await this.client.destroy();
  }

  async getUserAdminGuilds(access_token: string) {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user guilds");
    }

    const responseData = (await response.json()) as {
      id: string;
      name: string;
      icon: string;
      owner: boolean;
      permissions: number;
    }[];

    return responseData.filter(
      (guild: any) => guild.permissions & PermissionFlagsBits.Administrator
    );
  }
}

declare const global: CustomNodeJsGlobal;
const client = global.cachedClient || new DiscordClient();
if (env.NODE_ENV === "development") global.cachedClient = client;
export default client;
