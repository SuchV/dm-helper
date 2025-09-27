import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Interaction,
  MessageFlags,
} from "discord.js";
import { env } from "@spolka-z-l-o/env/bot-env";
import path from "path";
import cron from "node-cron";

import { presenceOptions } from "./helpers/presence";

export const client = new CustomClient({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildMembers"],
});

// import "./deploy-commands";
import { birthdateSchema } from "./validators/birthdate";
import { birthdayMentionCronJob } from "./helpers/birthday-mention";
import { CustomClient } from "./helpers/custom-client";

client.once("ready", async () => {
  console.log("Discord bot is ready! 🤖");

  client.user?.setActivity({
    name:
      presenceOptions[Math.floor(Math.random() * presenceOptions.length)] ??
      "Nothing... yet",
    type: ActivityType.Custom,
  });

  cron.schedule(
    "0 */3 * * *",
    async () => {
      client.user?.setActivity({
        name:
          presenceOptions[Math.floor(Math.random() * presenceOptions.length)] ??
          "Nothing... yet",
        type: ActivityType.Custom,
      });
    },
    {}
  );

  cron.schedule("0 */3 * * *", async () => {
    await birthdayMentionCronJob(client);
  });
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const commandPath = path.join(
    __dirname,
    "commands",
    `${interaction.commandName}.ts`
  );
  try {
    const command = require(commandPath);
    if (
      client.cooldowns.is_user_on_cooldown(
        interaction.commandName,
        interaction.user.id
      )
    ) {
      return await interaction.reply({
        content: `You are on cooldown for this command. Please wait ${command.cooldown} seconds. And try again.`,
      });
    }
    client.cooldowns.set_user_cooldown(
      interaction.commandName,
      interaction.user.id,
      command.cooldown ?? 60 // Default cooldown of 60 seconds if not specified
    );
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "There was an error executing that command.",
      flags: MessageFlags.Ephemeral,
    });
  }
});

(async () => {
  client.login(env.DISCORD_CLIENT_TOKEN);
})();
