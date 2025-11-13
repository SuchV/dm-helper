import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { withPermission } from "../helpers/with-permissions";
import { RoleGroup } from "@spolka-z-l-o/db/models/bot/RoleGroup";

export const data = new SlashCommandBuilder()
  .setName("role")
  .setDescription("Role management commands")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommandGroup((group) =>
    group
      .setName("group")
      .setDescription("Manage role groups")
      .addSubcommand((sub) =>
        sub
          .setName("add")
          .setDescription("Create a new role group")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("The name of the role group")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("roles-list")
              .setDescription(
                "Comma-separated list of roles to add to the group"
              )
              .setRequired(true)
          )
      )
  );

export async function commandHandler(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  const subcommand = interaction.options.getSubcommandGroup();

  if (subcommand === "group") {
    const action = interaction.options.getSubcommand();
    if (action === "add") {
      // Check if this guild doesn't have too much role groups defined
      const roleGroupsCount = await RoleGroup.countDocuments({
        guildId: interaction.guildId,
      });

      if (roleGroupsCount >= 10) {
        await interaction.reply({
          content:
            "You have reached the maximum number of role groups (10). Please delete some before adding new ones.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const name = interaction.options.getString("name", true);
      const rolesString = interaction.options.getString("roles-list", true);
      const roleIds =
        rolesString
          .match(/<@&(\d+)>/g)
          ?.map((match) => match.match(/\d+/)![0]) || [];

      if (roleIds.length > 50) {
        await interaction.reply({
          content: "You can only add up to 50 roles to a role group.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // Validate the role IDs and ensure they are valid roles in the guild
      await interaction.guild?.roles.fetch();
      const validRoles = roleIds.map((id) =>
        interaction.guild?.roles.cache.has(id)
      );

      if (validRoles.length === 0) {
        await interaction.reply({
          content: "No valid roles found in the provided list.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const res = RoleGroup.updateOne(
        {
          guildId: interaction.guildId,
          name: name,
        },
        {
          $set: {
            roles: roleIds,
          },
        },
        {
          upsert: true,
        }
      );

      if (!res) {
        console.error(
          "Failed to create or update role group in the database.",
          interaction.guildId,
          name,
          roleIds
        );
        await interaction.reply({
          content:
            "There was an error creating the role group. Please try again later.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Here you would implement the logic to create a role group
      // For now, we will just reply with the received data
      await interaction.reply({
        content: `Role group "${name}" created with roles: ${rolesString}`,
      });
    } else {
      console.log(interaction);
      await interaction.reply({
        content: "Unknown subcommand for role group.",
        flags: MessageFlags.Ephemeral,
      });
    }
  } else {
    await interaction.reply({
      content: "Unknown subcommand group.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

export const execute = withPermission(commandHandler, [
  PermissionsBitField.Flags.Administrator,
]);

export const cooldown = 30;
