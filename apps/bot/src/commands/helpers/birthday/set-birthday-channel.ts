import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  CommandInteraction,
  MessageFlags,
} from "discord.js";
import {
  GuildSettings,
  IGuildSettings,
} from "@spolka-z-l-o/db/models/GuildSettings";

export const setBirthdayChannel = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const channel = interaction.options.getChannel("channel");
  if (!channel || channel.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: "Please select a valid text channel.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const result = await GuildSettings.findOneAndUpdate<IGuildSettings>(
    { guildId: interaction.guildId },
    { birthdayChannelId: channel.id },
    { upsert: true }
  );

  if (!result) {
    console.error(result);
    await interaction.reply({
      content: "There was an error setting the birthday channel.",
    });
    return;
  }
  await interaction.reply({
    content: `Birthday channel set to <#${channel.id}>`,
  });
};
