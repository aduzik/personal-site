// @ts-check
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mdx from "@astrojs/mdx";
import rehypeSectionize from "@hbsnow/rehype-sectionize";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://aduzik.com/",
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeSectionize],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
