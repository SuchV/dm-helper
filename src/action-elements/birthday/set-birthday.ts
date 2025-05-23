import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

const monthFormatter = new Intl.DateTimeFormat("pl-PL", { month: "long" });

const yearArray = Array.from({ length: 100 }, (_, i) => {
  return (new Date().getFullYear() - i).toString();
});

const monthArray = Array.from({ length: 12 }, (_, i) => {
  return monthFormatter.format(new Date(0, i));
});

const dayArray = Array.from({ length: 31 }, (_, i) => {
  return (i + 1).toString();
});

// const dayActionRow =
//   new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
//     new StringSelectMenuBuilder()
//       .setCustomId("day")
//       .setPlaceholder("Select day")
//       .addOptions(
//         dayArray.map((day, index) => ({
//           label: day,
//           value: index.toString(),
//         }))
//       )
//   );

const monthActionRow =
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("month")
      .setPlaceholder("Select month")
      .addOptions(
        monthArray.map((month, index) => ({
          label: month,
          value: index.toString(),
        }))
      )
  );

// const yearActionRow =
//   new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
//     new StringSelectMenuBuilder()
//       .setCustomId("year")
//       .setPlaceholder("Select year")
//       .addOptions(
//         yearArray.map((year) => ({
//           label: year,
//           value: year,
//         }))
//       )
//   );

export const actionElementsBirthdaySet = [
  //dayActionRow,
  monthActionRow,
  //yearActionRow,
];
