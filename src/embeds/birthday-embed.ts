import { EmbedBuilder } from "discord.js";

export const getBirthdayEmbed = () => {
  const birthdayEmbed = new EmbedBuilder()
    .setTitle("🎉 Birthday module 🎉")
    .setDescription("This module allows you to set and get your birthday.")
    .setColor("#FFD700")
    .setFooter({ text: "Birthday module" });
  birthdayEmbed.addFields({
    name: "Set your birthday",
    value: "Use `/birthday set` to set your birthday.",
    inline: true,
  });
  birthdayEmbed.addFields({
    name: "Set your birthday",
    value: "Use `/birthday set` to set your birthday.",
    inline: true,
  });
  birthdayEmbed.addFields({
    name: "Set your birthday",
    value: "Use `/birthday set` to set your birthday.",
    inline: true,
  });
  return birthdayEmbed;
};
