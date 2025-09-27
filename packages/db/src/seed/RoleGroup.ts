import mongoose from "mongoose";
import { RoleGroup } from "@prisma/client";

const seedData = [
  {
    _id: new mongoose.Types.ObjectId("66524f9f5a3a3e1c7f9b3c21"),
    guildId: "759383031332339734",
    name: "Age",
    rolesIdArray: [
      "1328050631826473042", // 18+
      "1328050686063280208", // 500+
    ],
  },
  {
    _id: new mongoose.Types.ObjectId("66524fa15a3a3e1c7f9b3c22"),
    guildId: "759383031332339734",
    name: "Gender",
    rolesIdArray: [
      "1328051916244127786", // Woman
      "1328051944714932297", // Man
    ],
  },
];

export const runQuery = async () => {
  try {
    await RoleGroup.insertMany(seedData);
    console.log("RoleGroup seed data inserted successfully.");
  } catch (error) {
    console.error("Error inserting RoleGroup seed data:", error);
  }
};
