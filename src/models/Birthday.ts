// src/models/User.ts
import { Schema, model } from "mongoose";

interface IBirthday {
  userId: string;
  birthday_date: Date;
}

const birthdaySchema = new Schema<IBirthday>({
  userId: { type: String, required: true, unique: true },
  birthday_date: { type: Date, required: true },
});

export const User = model<IBirthday>("Birthday", birthdaySchema);
