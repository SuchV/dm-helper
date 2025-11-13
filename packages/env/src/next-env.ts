import { createEnv } from "@t3-oss/env-nextjs";

import { envSchema } from "./helpers";

export const env = createEnv(envSchema);
