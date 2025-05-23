// src/models/User.ts
import { Schema, model } from "mongoose";

export interface IGuildSettings {
  languageCode: string;
  birthdayChannelId: string | null;
  birthdayRoleId: string | null;
  guildId: string;
}

const guildSettingsSchema = new Schema<IGuildSettings>({
  languageCode: { type: String, default: "en" },
  birthdayChannelId: { type: String, default: null },
  birthdayRoleId: { type: String, default: null },
  guildId: { type: String, required: true },
});

export const GuildSettings = model<IGuildSettings>(
  "GuildSettings",
  guildSettingsSchema
);
