import { resolve } from "path";
import { defineConfig, globalIgnores } from "eslint/config";

import baseConfig from "../../eslint.config.mjs";

const eslintConfig = defineConfig([
  ...baseConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores(["dist/**/*", ".astro/**/*"]),
  {
    settings: {
      tailwindcss: {
        config: resolve(import.meta.dirname, "tailwind.config.mjs"),
      },
    },
  },
]);

export default eslintConfig;
