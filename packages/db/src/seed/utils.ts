import { prisma } from "..";

export const clearDb = async () => {
  const promise = prisma.$transaction([
    prisma.bingoEntry.deleteMany(),
    prisma.bingo.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  return promise;
};
