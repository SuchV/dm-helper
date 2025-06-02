import { Verification } from "../../models/Verification";

const seedData = [
  {
    guildId: "759383031332339734",
    channelId: "1376213606970036355",
    messageId: "1376213730626637955",
    requiredRoleGroups: [
      "66524f9f5a3a3e1c7f9b3c21",
      "66524fa15a3a3e1c7f9b3c22",
    ],
    verifiedRole: "759383153621598248",
    unverifiedRole: "759383072981909506",
    confirmEmoji: ":white_check_mark:",
  },
];

export const runQuery = async () => {
  try {
    await Verification.insertMany(seedData);
    console.log("Verification seed data inserted successfully.");
  } catch (error) {
    console.error("Error inserting Verification seed data:", error);
  }
};
