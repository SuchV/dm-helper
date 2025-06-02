import baseConfig, {
  restrictEnvAccess,
} from "@spolka-z-l-o/eslint-config/base";
import nextjsConfig from "@spolka-z-l-o/eslint-config/nextjs";
import reactConfig from "@spolka-z-l-o/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
