import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("pingpong")
  .setDescription("Replies with Pong! Changed!!! 2");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("Pong! Changed!!!");
}
