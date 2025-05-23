import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  CacheType,
} from "discord.js";

import { setBirthday } from "./helpers/birthday/set-birthday";
import { getBirthday } from "./helpers/birthday/get-birthday";
import { getBirthdayEmbed } from "../embeds/birthday-embed";
import { birthdayHelpButtons } from "../components/birthday-components";
import { set } from "mongoose";
import { setBirthdayRole } from "./helpers/birthday/set-birthday-role";
import { setBirthdayChannel } from "./helpers/birthday/set-birthday-channel";

export const data = new SlashCommandBuilder()
  .setName("birthday")
  .setDescription("Birthday commands")
  .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
    sub
      .setName("set")
      .setDescription("Set your birthday")
      .addStringOption((option) =>
        option
          .setName("day")
          .setDescription("The day of the user's birthday.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("month")
          .setDescription("The month of the user's birthday.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("year")
          .setDescription("The year of the user's birthday.")
          .setRequired(true)
      )
  )
  .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
    sub
      .setName("get")
      .setDescription("Get your birthday")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to get the birthday of.")
          .setRequired(false)
      )
  )
  .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
    sub
      .setName("setrole")
      .setDescription("Sets the birthday role")
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The role to set as the birthday role")
          .setRequired(true)
      )
  )
  .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
    sub
      .setName("setchannel")
      .setDescription("Sets the birthday channel")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to set as the birthday channel")
          .setRequired(true)
      )
  )
  .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
    sub.setName("help").setDescription("Get help with the birthday command")
  );

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>
): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "set") {
    await setBirthday(interaction);
  } else if (subcommand === "get") {
    await getBirthday(interaction);
  } else if (subcommand === "setrole") {
    await setBirthdayRole(interaction);
  } else if (subcommand === "setchannel") {
    await setBirthdayChannel(interaction);
  } else if (subcommand === "help") {
    await interaction.reply({
      content: "Use `/birthday set` to set your birthday.",
    });
  } else {
    await interaction.reply({
      content: "Unknown subcommand.",
    });
  }
}
