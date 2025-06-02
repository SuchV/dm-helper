import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("roleadd")
  .setDescription("Testing role add and order.");

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  await interaction.reply({
    content: "This command is under development.",
  });
}

export const cooldown = 30;
