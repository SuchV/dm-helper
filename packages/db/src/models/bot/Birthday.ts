import { Schema, model } from "mongoose";

export interface IBirthday {
  userId: string;
  birthday_date: Date;
  guildId: string;
  last_year_mentioned: number;
}

const schema = new Schema<IBirthday>(
  {
    userId: { type: String, required: true, unique: true },
    birthday_date: { type: Date, required: true },
    guildId: { type: String, required: true },
    last_year_mentioned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Birthday = model<IBirthday>("Birthday", schema);
