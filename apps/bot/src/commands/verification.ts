import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  CommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import {
  IVerification,
  Verification,
} from "@spolka-z-l-o/db/models/Verification";

export const data = new SlashCommandBuilder()
  .setName("verification")
  .setDescription("Testing role add and order.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName("setchannel")
      .setDescription("Set the verification channel")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to set for verification")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Create a verification message")
      .addStringOption((option) =>
        option
          .setName("requiredgroups")
          .setDescription(
            "The groups required for verification (comma-separated)"
          )
          .setRequired(true)
      )
      .addRoleOption((option) =>
        option
          .setName("verifiedrole")
          .setDescription("The role to assign upon verification")
          .setRequired(true)
      )
      .addRoleOption((option) =>
        option
          .setName("unverifiedrole")
          .setDescription("The role to assign if verification fails (optional)")
      )
  );

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "setchannel") {
    const channel = interaction.options.getChannel("channel");
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "Please provide a valid text channel.",
        ephemeral: true,
      });
    }
    // Here you would set the channel in your database or configuration
    // For example:
    const res = Verification.updateOne<IVerification>(
      {
        guildId: interaction.guildId,
      },
      {
        channelId: channel.id,
      },
      {
        upsert: true,
      }
    );
    if (!res) {
      return interaction.reply({
        content: "Failed to set the verification channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
    await interaction.reply({
      content: `Verification channel set to ${channel.name}.`,
    });
  } else if (subcommand === "create") {
    const requiredGroups = interaction.options.getString("requiredgroups");
    const verifiedRole = interaction.options.getRole("verifiedrole");
    const unverifiedRole = interaction.options.getRole("unverifiedrole");

    if (!requiredGroups || !verifiedRole) {
      return interaction.reply({
        content: "Required groups and verified role are mandatory.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const verificationSettings = await Verification.findOne<IVerification>({
      guildId: interaction.guildId,
    });

    if (!verificationSettings) {
      return interaction.reply({
        content:
          "Verification settings not found. Please set the channel first.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channel = await interaction.guild?.channels.fetch(
      verificationSettings.channelId
    );

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content:
          "Verification channel not found. Please set the channel first.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const roleIds =
      requiredGroups
        .match(/<@&(\d+)>/g)
        ?.map((match) => match.match(/\d+/)![0]) || [];

    const requiredGroupsMap = requiredGroups;

    await channel.send({
      content: `Verification: 
      Age: `,
    });

    await interaction.reply({
      content: "Verification message created successfully.",
    });
  } else {
    await interaction.reply({
      content: "Unknown subcommand.",
    });
  }
}

export const cooldown = 30;
