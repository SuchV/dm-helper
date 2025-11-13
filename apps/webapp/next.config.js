import { fileURLToPath } from "url";
import _jiti from "jiti";
import webpack from "webpack";

const jiti = _jiti(fileURLToPath(import.meta.url));

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
jiti("@repo/env/next-env");

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@repo/api",
    "@repo/auth",
    "@repo/discord",
    "@repo/env/next-env",
    "@repo/supabase",
    "@repo/ui",
    "@repo/validators",
  ],
  env: {
    PORT: process.env.PORT,
  },

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

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
