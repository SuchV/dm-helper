import { PrismaClient } from "@prisma/client";
import { env } from "@repo/env/next-env";
import dotenv from "dotenv";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
}

dotenv.config({ path: "../../../.env" });

// prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;
const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
if (env.NODE_ENV === "development") global.prisma = prisma;
export { prisma };
export type { Prisma } from "@prisma/client";
