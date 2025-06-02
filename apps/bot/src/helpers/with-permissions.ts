import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  InteractionReplyOptions,
} from "discord.js";

export function withPermission(
  handler: (interaction: ChatInputCommandInteraction) => Promise<any>,
  requiredPermissions: bigint[]
) {
  return async (interaction: ChatInputCommandInteraction) => {
    const memberPerms = interaction.memberPermissions;
    const hasAll = requiredPermissions.every((perm) => memberPerms?.has(perm));

    if (!hasAll) {
      const reply: InteractionReplyOptions = {
        content: "🚫 You do not have permission to use this command.",
        ephemeral: true,
      };
      return interaction.reply(reply);
    }

    return handler(interaction);
  };
}
