import { z } from "zod";
import { parse } from "date-fns";

export const birthdateSchema = z
  .string()
  .regex(/^\d{4}-\d{1,2}-\d{1,2}$/, "Date must be in YYYY-MM-DD format")
  .transform((str) => {
    const date = new Date(str);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date;
  });

export type BirthdayDateType = z.infer<typeof birthdateSchema>;

export const birthdayGetMethod = z.enum(["self", "foreign"]);

export type BirthdayGetMethodType = z.infer<typeof birthdayGetMethod>;
