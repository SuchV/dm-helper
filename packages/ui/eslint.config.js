import baseConfig from "@repo/eslint-config/base";
import reactConfig from "@repo/eslint-config/react";

/** @type {import('@repo/eslint-config/types').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
