import tailwind from "eslint-plugin-tailwindcss";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  ...tailwind.configs["flat/recommended"],
  // Override default ignores of eslint-config-next.
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    rules: {
      "tailwindcss/no-custom-classname": [
        "error",
        {
          severity: "warn",
          whitelist: ["content-container"],
        },
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
