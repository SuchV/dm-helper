import { dotenvLoad } from "dotenv-mono";

import { botEnvSchema } from "./helpers";

dotenvLoad();

const envParsed = botEnvSchema.safeParse(process.env);
if (!envParsed.success) {
  console.error("Environment variables validation failed:", envParsed.error);
  process.exit(1);
}

export const env = envParsed.data;
