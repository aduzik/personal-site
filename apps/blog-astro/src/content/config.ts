import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({
    base: "src/content/posts",
    pattern: ["**/*.md", "**/*.mdx"],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      date: z.coerce.date(),
      heroImage: image().optional(),
      description: z.string().optional(),
      excerpt: z.string().optional(),
      updated: z.coerce.date().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

const pages = defineCollection({
  loader: glob({
    base: "src/content/pages",
    pattern: ["**/*.md", "**/*.mdx"],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      heroImage: image().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = { articles, pages };
