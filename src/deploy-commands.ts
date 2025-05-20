import { REST, Routes, SlashCommandBuilder } from "discord.js";
import env from "./helpers/env";
import fs from "node:fs";
import path from "node:path";

const commands: SlashCommandBuilder[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(env.TOKEN);

(async () => {
  try {
    console.log("🔁 Refreshing application (/) commands...");

    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
      body: commands,
    });

    console.log("✅ Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
