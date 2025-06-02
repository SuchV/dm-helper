import { REST, Routes } from "discord.js";
import { env } from "@spolka-z-l-o/env/bot-env";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "url";

// Change the type to match what you're actually storing
const commands: any[] = [];
// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, "commands");

// Load commands only from the main directory, not subdirectories
async function loadCommandsFromMainDirectory(dirPath: string) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    // Skip subdirectories - only process files in the main directory
    if (item.isDirectory()) {
      continue; // Skip directories completely
    }

    const itemPath = path.join(dirPath, item.name);

    if (
      (item.name.endsWith(".ts") || item.name.endsWith(".js")) &&
      !item.name.endsWith(".d.ts")
    ) {
      try {
        // Import the command file
        const fileUrl = pathToFileURL(itemPath);
        const commandModule = await import(fileUrl.href);

        // Handle files that export a 'commands' array
        if (
          "commands" in commandModule &&
          Array.isArray(commandModule.commands)
        ) {
          for (const commandFile of commandModule.commands) {
            if ("data" in commandFile) {
              console.log(
                `Loading command from ${item.name}: ${
                  commandFile.data.name || "[unnamed]"
                }`
              );
              commands.push(commandFile.data.toJSON());
            }
          }
        }
        // Handle files that directly export a command with 'data'
        else if ("data" in commandModule) {
          console.log(
            `Loading command from ${item.name}: ${
              commandModule.data.name || "[unnamed]"
            }`
          );
          commands.push(commandModule.data.toJSON());
        }
      } catch (error) {
        console.error(`Error loading command from ${itemPath}:`, error);
      }
    }
  }
}

// Start the loading process (non-recursive)
await loadCommandsFromMainDirectory(commandsPath);

// Log the total number of commands found
console.log(`Found ${commands.length} commands to register`);

const rest = new REST().setToken(env.DISCORD_CLIENT_SECRET);

(async () => {
  try {
    console.log("🔁 Refreshing application (/) commands...");

    if (commands.length === 0) {
      console.warn("⚠️ No commands found to register!");
      return;
    }

    let result;

    if (env.DEV_GUILD_ID) {
      const GUILD_ID = env.DEV_GUILD_ID;
      console.log(`⚙️ Registering commands to guild: ${GUILD_ID}`);

      result = await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, GUILD_ID),
        { body: commands }
      );
    } else {
      // Register globally
      console.log("🌍 Registering global commands...");

      result = await rest.put(
        Routes.applicationCommands(env.DISCORD_CLIENT_ID),
        { body: commands }
      );
    }

    console.log(
      `✅ Successfully reloaded ${
        Array.isArray(result) ? result.length : 0
      } application (/) commands.`
    );
  } catch (error) {
    console.error("❌ Error refreshing commands:", error);
  }
})();
