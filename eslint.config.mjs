import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from 'eslint-plugin-tailwindcss';
import path from "path";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...tailwind.configs['flat/recommended'],
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
    {
        settings: {
            tailwindcss: {
                config: path.join(process.cwd(), "tailwind.config.mjs"),
            },
        },
    }
]);

export default eslintConfig;
