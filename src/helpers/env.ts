import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  PREFIX: z.string().min(1).max(1).default("`"),
  TOKEN: z.string().min(1),
  MONGO_URI: z.string().url().default("mongodb://localhost:27017/spolka-bot"),
  DISCORD_CLIENT_ID: z.string().min(1),
  ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("production"),
  DEV_GUILD_ID: z.string().min(1).optional(),
});

const env = schema.parse(process.env);

export default env;
