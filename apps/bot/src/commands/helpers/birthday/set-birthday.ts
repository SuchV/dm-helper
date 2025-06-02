import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { birthdateSchema } from "../../../validators/birthdate";
import { Birthday } from "@spolka-z-l-o/db/models/Birthday";
import { actionElementsBirthdaySet } from "../../../action-elements/birthday/set-birthday";

export const setBirthday = async (interaction: CommandInteraction) => {
  const user = interaction.user;
  const userId = user.id;

  const birthDay = interaction.options.get("day");
  const birthMonth = interaction.options.get("month");
  const birthYear = interaction.options.get("year");

  const birthDateString = `${birthYear?.value}-${birthMonth?.value}-${birthDay?.value}`;

  const birthdayDate = birthdateSchema.safeParse(birthDateString);

  if (birthdayDate.error) {
    console.error(birthdayDate.error);
    await interaction.reply("Please provide a valid birthday date.");
  }

  const newBirthday = await Birthday.findOneAndUpdate(
    {
      userId,
    },
    {
      userId,
      birthday_date: birthdayDate.data,
      guildId: interaction.guildId,
    },
    { upsert: true, new: true }
  );
  newBirthday.save();

  await interaction.reply(
    `Birthday set successfully! ${newBirthday.birthday_date.toLocaleDateString()}`
  );
};
