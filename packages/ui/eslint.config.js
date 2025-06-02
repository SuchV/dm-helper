import baseConfig from "@spolka-z-l-o/eslint-config/base";
import reactConfig from "@spolka-z-l-o/eslint-config/react";

/** @type {import('@spolka-z-l-o/eslint-config/types').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
