import path from "path";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import baseConfig from '../../eslint.config.mjs';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...baseConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
    },
  },
  {
    settings: {
      tailwindcss: {
        config: path.join(process.cwd(), "tailwind.config.mjs"),
      },
    },
  }
]);

export default eslintConfig;
