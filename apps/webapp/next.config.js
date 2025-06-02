import { fileURLToPath } from "url";
import _jiti from "jiti";

const jiti = _jiti(fileURLToPath(import.meta.url));

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
jiti("@spolka-z-l-o/env/next-env");

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@spolka-z-l-o/api",
    "@spolka-z-l-o/auth",
    "@spolka-z-l-o/discord",
    "@spolka-z-l-o/env/next-env",
    "@spolka-z-l-o/supabase",
    "@spolka-z-l-o/ui",
    "@spolka-z-l-o/validators",
  ],
  env: {
    PORT: process.env.PORT,
  },

  serverExternalPackages: ["sequelize", "pino", "pino-pretty"],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  redirects: async () => {
    return [
      {
        source: "/_db",
        destination: "http://localhost:54323",
        basePath: false,
        permanent: false,
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        "discord.js": false,
      };
    }
    return config;
  },
};
