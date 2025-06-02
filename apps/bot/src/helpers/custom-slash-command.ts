import { SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface CustomSlashCommand extends SlashCommandSubcommandsOnlyBuilder {
  category?: string;
  cooldown?: number;
}
