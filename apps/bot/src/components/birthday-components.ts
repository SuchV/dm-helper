import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const birthdayHelpButtons =
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Button danger")
      .setCustomId("button-danger")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setLabel("button Link")
      .setURL("https://www.google.pl")
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel("button primary")
      .setCustomId("button-primary")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel("button Secondary")
      .setCustomId("button-Secondary")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("button success")
      .setCustomId("button-success")
      .setStyle(ButtonStyle.Success)
  );
