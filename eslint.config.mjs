import path from "path";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";
import unusedImports from "eslint-plugin-unused-imports";
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwind.configs["flat/recommended"],
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
    }
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    }
  },
  {
    settings: {
      tailwindcss: {
        config: path.join(process.cwd(), "tailwind.config.mjs"),
      },
    },
    rules: {
      "tailwindcss/no-custom-classname": ["error",
        {
          severity: "warn",
          whitelist: ["content-container"]
        }
      ],
    },
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
