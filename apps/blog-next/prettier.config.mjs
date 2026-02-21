import baseConfig from "../../prettier.config.mjs";

/** @type{import('prettier').Config} */
const config = {
  ...baseConfig,
  plugins: [...baseConfig.plugins, "prettier-plugin-tailwindcss"],
  importOrder: [
    "^react(.*)$",
    "^(@[^/]+)?remark-(.*)$",
    "^(@[^/]+)?rehype-(.*)$",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(.*)$",
    "",
    "^[./]",
  ],
  tailwindStylesheet: "./src/app/globals.css",
};

export default config;
