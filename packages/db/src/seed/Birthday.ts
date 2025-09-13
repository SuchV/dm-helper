import { Birthday } from "@prisma/client";
import prisma from "..";

const seedData: Omit<Birthday, "id">[] = [
  {
    providerAccountId: "249276751400665088",
    birthday_date: new Date(),
    guildId: "759383031332339734",
    last_year_mentioned: 0,
  },
  {
    providerAccountId: "110339124719824896",
    birthday_date: new Date(),
    guildId: "759383031332339734",
    last_year_mentioned: 0,
  },
];

export const runQuery = async () => {
  try {
    await prisma.birthday.createMany({
      data: seedData,
    });
    console.log("Birthday seed data inserted successfully.");
  } catch (error) {
    console.error("Error inserting Birthday seed data:", error);
  }
};
