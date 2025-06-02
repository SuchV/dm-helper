import mongoose from "mongoose";
import { botEnv } from "@spolka-z-l-o/env";
import { runQuery as runQueryBirthday } from "./seed/Birthday";
import { runQuery as runQueryGuildSettings } from "./seed/GuildSettings";
import { runQuery as runQueryRoleGroup } from "./seed/RoleGroup";
import { runQuery as runQueryVerification } from "./seed/Verification";

// Import your models
// TODO: Replace with actual model imports

const seed = async () => {
  try {
    await mongoose.connect(botEnv.MONGO_URI);
    console.log("Connected to MongoDB");

    // Import seed scripts
    await runQueryBirthday();
    await runQueryGuildSettings();
    await runQueryRoleGroup();
    await runQueryVerification();

    console.log("Seeding complete.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
