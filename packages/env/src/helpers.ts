import { z } from "zod";

export const envSchema = {
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
    PORT: z.union([z.number(), z.string()]).default(3000),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    VERCEL: z.string().optional(),
    VERCEL_URL: z.string().optional(),

    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),

    DATABASE_URL: z.string().min(1),
    PREFIX: z.string().min(1).max(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1).default("xoxo-secret-xoxo"),
    NEXTAUTH_URL: z.string().url(),
    ENVIRONMENT: z.string().optional().default("local"),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_BRANCH_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    NEXT_PUBLIC_PDF_WORKER_SRC: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_PDF_WORKER_SRC: process.env.NEXT_PUBLIC_PDF_WORKER_SRC,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    ENVIRONMENT: process.env.ENVIRONMENT,
    PORT: process.env.PORT,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
};

export const botEnvSchema = z.object(envSchema.server);
