// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSectionize from '@hbsnow/rehype-sectionize';

// https://astro.build/config
export default defineConfig({
  site: "https://aduzik.com/",
  integrations: [mdx({
    remarkPlugins: [
      remarkMath,
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSectionize
    ]
  })],

  vite: {
    plugins: [tailwindcss()]
  }
});