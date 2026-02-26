import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

import { createItemType, createWatcher, getItemFunctions } from "./content";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ContentItem {
  title: string;
  slug: string;
  content: string;
  filePath: string;
  excerpt?: string;
  heroImage?: string;
}

export interface Page extends ContentItem {
  frontmatter: {
    title: string;
    slug: string;
    heroImage?: string;
  };
}

export interface Post extends ContentItem {
  frontmatter: {
    title: string;
    slug: string;
    date: string;
    summary?: string;
    tags?: string[];
    heroImage?: string;
    draft?: boolean;
  };
}

type ItemContent<TFrontmatter> = {
  content: string;
  data: TFrontmatter;
  excerpt?: string;
};

async function getItemContent<TFrontmatter = unknown>(
  relativePath: string,
  fileContent: string,
): Promise<ItemContent<TFrontmatter>> {
  const { content, data, excerpt } = matter(fileContent, {
    excerpt_separator: "{/* excerpt */}",
    excerpt: true,
  });

  return { content, data: data as TFrontmatter, excerpt };
}

const pages = createItemType("page", {
  rootPath: "content/pages",
  matchPath: /\.mdx?$/,
  async getItem(relativePath: string, fileContent: string): Promise<Page> {
    const {
      content,
      data: frontmatter,
      excerpt,
    } = await getItemContent<Page["frontmatter"]>(relativePath, fileContent);

    const { title, slug, heroImage } = frontmatter;

    return {
      title,
      slug,
      excerpt,
      heroImage,
      frontmatter,
      content,
      filePath: relativePath,
    };
  },
  getItemMetdata(item: Page) {
    return {
      slug: item.frontmatter.slug,
    };
  },
});

const posts = createItemType("post", {
  rootPath: "content/posts",
  matchPath: /\.mdx?$/,
  async getItem(relativePath: string, fileContent: string): Promise<Post> {
    const {
      content,
      data: frontmatter,
      excerpt,
    } = await getItemContent<Post["frontmatter"]>(relativePath, fileContent);

    return {
      title: frontmatter.title,
      slug: frontmatter.slug,
      excerpt,
      heroImage: frontmatter.heroImage,
      frontmatter,
      content,
      filePath: relativePath,
    };
  },
  getItemMetdata(item: Post) {
    return {
      slug: item.frontmatter.slug,
    };
  },
  filter(item: Post) {
    return item.frontmatter.draft !== true;
  },
  sortOptions: {
    compare: ({ frontmatter: { date: leftDate } }, { frontmatter: { date: rightDate } }) =>
      Date.parse(leftDate) - Date.parse(rightDate),
    order: "desc",
  },
});

const root = path.join(__dirname, "../../../../");

await createWatcher({
  root,
  contentRoot: path.join(root, "./content"),
})
  .watchItem(pages)
  .watchItem(posts)
  .start();

const { getAllPageItems, findPageBySlug } = getItemFunctions(pages);

const { getAllPostItems, findPostBySlug } = getItemFunctions(posts);

export function getNextPost(post: Post) {
  const allPosts = getAllPostItems();
  const index = allPosts.indexOf(post);
  return index !== -1 && index < allPosts.length - 1 ? allPosts[index + 1] : null;
}

export function getPreviousPost(post: Post) {
  const allPosts = getAllPostItems();
  const index = allPosts.indexOf(post);
  return index > 0 ? allPosts[index - 1] : null;
}

export { getAllPageItems, findPageBySlug, getAllPostItems, findPostBySlug };
