// src/models/User.ts
import { Schema, model } from "mongoose";
import { number } from "zod";

export interface IBirthday {
  userId: string;
  birthday_date: Date;
  guildId: string;
  last_year_mentioned: number;
}

const birthdaySchema = new Schema<IBirthday>({
  userId: { type: String, required: true, unique: true },
  birthday_date: { type: Date, required: true },
  guildId: { type: String, required: true },
  last_year_mentioned: { type: Number, default: 0 },
});

export const Birthday = model<IBirthday>("Birthday", birthdaySchema);
