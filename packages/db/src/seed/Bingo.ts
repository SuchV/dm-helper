import { Bingo, BingoEntry } from "@prisma/client";
import { prisma } from "..";

const seedData: Omit<Bingo, "id" | "createdAt" | "updatedAt"> = {
  guildId: "759383031332339734",
  channelId: "123456789012345678",
  messageId: "987654321098765432",
  name: "Sample Bingo",
  dimension: 5,
};

export const runQuery = async () => {
  try {
    const newBingo = await prisma.bingo.create({
      data: seedData,
    });
    const bingoEntries: Omit<
      BingoEntry,
      "id" | "createdAt" | "updatedAt" | "userId"
    >[] = Array.from(
      { length: newBingo.dimension * newBingo.dimension },
      (_, i) => ({
        bingoId: newBingo.id,
        entry: `Entry ${i + 1}`,
      })
    );
    await prisma.bingoEntry.createMany({
      data: bingoEntries,
    });
    console.log("Bingo seed data inserted successfully.");
  } catch (error) {
    console.error("Error inserting Bingo seed data:", error);
  }
};
