// @ts-check
import remarkMath from "remark-math";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import mdx from "@astrojs/mdx";
import rehypeSectionize from "@hbsnow/rehype-sectionize";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

/** @type{import('rehype-autolink-headings').Options} */
const headingsOptions = {
  behavior: "wrap",
  properties: {
    dataHeadingLink: true,
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://aduzik.com/",
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeSectionize, rehypeSlug, [rehypeAutolinkHeadings, headingsOptions]],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
