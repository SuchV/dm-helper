import mongoose from "mongoose";
import UserModel from "../models/auth/User";
import prisma from "..";

const seedDataUser = {
  name: "TestUser",
  id: "123",
  email: "testuser@example.com",
  image: "",
  emailVerified: new Date(),
};

const seedDataAccount = {
  type: "type",
  provider: "local",
  providerAccountId: "123",
  access_token: "123",
};

export const runQuery = async () => {
  try {
    const newUser = await prisma.user.create({
      data: seedDataUser,
    });

    await prisma.account.create({
      data: {
        ...seedDataAccount,
        userId: newUser.id,
      },
    });
    console.log("User seed data inserted successfully.");
  } catch (error) {
    console.error("Error inserting User seed data:", error);
  }
};
