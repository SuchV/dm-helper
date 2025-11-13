import baseConfig from "@repo/eslint-config/base";

/** @type {import('@repo/eslint-config/types').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
];
