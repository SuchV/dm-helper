import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { BirthdayGetMethodType } from "../../../validators/birthdate";
import { Birthday } from "@spolka-z-l-o/db/models/Birthday";

export const getBirthday = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  let getMethod: BirthdayGetMethodType = "self";
  let user = interaction.user;
  const foreignUser = interaction.options.getUser("user");

  if (foreignUser) {
    getMethod = "foreign";
    user = foreignUser;
  }

  const birthday = await Birthday.findOne({ userId: user.id });
  if (!birthday) {
    await interaction.reply("No birthday set.");
    return;
  }

  const birthdayDate = birthday.birthday_date;
  const currentDate = new Date();
  const isBirthdayToday =
    birthdayDate.getMonth() === currentDate.getMonth() &&
    birthdayDate.getDate() === currentDate.getDate();

  await interaction.reply(
    `Your birthday is on ${birthday.birthday_date.toLocaleDateString()}. ${
      isBirthdayToday
        ? `🎉 Happy birthday! 🎉 You're ${
            new Date().getFullYear() - birthdayDate.getFullYear()
          } years old!`
        : "Not your birthday today."
    }`
  );
};
