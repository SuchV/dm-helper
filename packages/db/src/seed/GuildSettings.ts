import { GuildSettings } from "../models/bot/GuildSettings";

const seedData = [
  {
    guildId: "759383031332339734",
    birthdayChannelId: "1328529989028544544",
    birthdayRoleId: "1375616177002512445",
    languageCode: "en",
  },
];

export const runQuery = async () => {
  try {
    await GuildSettings.insertMany(seedData);
    console.log("GuildSettings seed data inserted successfully.");
  } catch (error) {
    console.error("Error inserting GuildSettings seed data:", error);
  }
};
