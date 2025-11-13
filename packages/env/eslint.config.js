import baseConfig from "@spolka-z-l-o/eslint-config/base";

/** @type {import('@spolka-z-l-o/eslint-config/types').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
];
