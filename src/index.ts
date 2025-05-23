import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Interaction,
} from "discord.js";
import env from "./helpers/env";
import path from "path";
import fs from "fs";
import { connectToDatabase } from "./db";
import { parse } from "date-fns";
import cron from "node-cron";

import { presenceOptions } from "./helpers/presence";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

import "./deploy-commands";
import { birthdateSchema } from "./validators/birthdate";
import { birthdayMentionCronJob } from "./helpers/birthday-mention";

client.once("ready", async () => {
  console.log("Discord bot is ready! 🤖");

  client.user?.setActivity({
    name: presenceOptions[Math.floor(Math.random() * presenceOptions.length)],
    type: ActivityType.Custom,
  });

  //0 */3 * * *

  cron.schedule("* * * * *", async () => {
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
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "There was an error executing that command.",
      ephemeral: true,
    });
  }
});

(async () => {
  await connectToDatabase();
  client.login(env.TOKEN);
})();
