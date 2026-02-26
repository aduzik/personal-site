/** @type{import('prettier').Config} */
const config = {
  "plugins": ["@ianvs/prettier-plugin-sort-imports"],
  "experimentalTernaries": true,
  "tabWidth": 2,
  "printWidth": 120,
  "trailingComma": "all",
  "proseWrap": "always",
  "quoteProps": "as-needed",
  "importOrder": [
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(.*)$",
    "",
    "^[./]"
  ],
}

export default config;