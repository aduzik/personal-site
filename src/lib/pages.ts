import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type PageFrontmatter = {
  title: string;
  slug: string;
  heroImage?: string;
};

export type PageData = {
  frontmatter: PageFrontmatter;
  filePath: string;
  relativePath: string;
  content: string;
  excerpt?: string;
};

type PageDataMap = {
  [path: string]: PageData;
};

type SlugMap = {
  [slug: string]: PageData;
};

const pageDataMap: PageDataMap = {};
const slugMap: SlugMap = {};
const pageData: PageData[] = [];

const contentPath = path.resolve(process.cwd(), "src/page-content");

async function getPageData(relativePath: string) {
  const filePath = path.join(contentPath, relativePath);
  const fileContent = await fs.readFile(filePath, {
    encoding: "utf-8",
    flag: "r",
  });

  const {
    data: frontmatter,
    content,
    excerpt,
  } = matter(fileContent, {
    excerpt: true,
    excerpt_separator: "{/* excerpt */}",
  });

  const pageFrontmatter = frontmatter as PageFrontmatter;
  //   if (pageFrontmatter.heroImage) {
  //     const fileDirectory = path.dirname(filePath);
  //     const heroAbsolutePath = path.resolve(fileDirectory, pageFrontmatter.heroImage);
  //     const heroPath = path.relative(process.cwd(), heroAbsolutePath);
  //     pageFrontmatter.heroImage = heroPath;
  //   }

  const pageData: PageData = {
    frontmatter: pageFrontmatter,
    filePath,
    relativePath,
    content,
    excerpt,
  };

  return pageData;
}

async function startWatching() {
  const fileWatcher = fs.watch(contentPath, {
    encoding: "utf-8",
    recursive: true,
  });

  for await (const event of fileWatcher) {
    switch (event.eventType) {
      case "change": {
        if (!event.filename) break;

        const dataObj = await getPageData(event.filename);
        const oldPageData = pageDataMap[event.filename];

        if (oldPageData) {
          const index = pageData.indexOf(oldPageData);
          if (index !== -1) {
            pageData.splice(index, 1, dataObj);
          }
        } else {
          pageData.push(dataObj);
        }
        pageDataMap[event.filename] = dataObj;
        slugMap[dataObj.frontmatter.slug] = dataObj;

        break;
      }

      case "rename": {
        break;
      }
    }
    console.log("Page content changed, rebuilding...", event);
  }
}

async function populatePageData() {
  const mdxFilePaths = await fs.readdir(contentPath, {
    recursive: true,
    withFileTypes: true,
  });

  for (const entry of mdxFilePaths.filter((e) => e.isFile())) {
    const isMDX = /\.mdx?$/.test(entry.name);
    if (!isMDX) continue;

    const filePath = path.join(entry.parentPath, entry.name);
    const relativePath = path.relative(contentPath, filePath);

    const dataObj = await getPageData(relativePath);
    const {
      frontmatter: { slug },
    } = dataObj;

    pageData.push(dataObj);
    pageDataMap[relativePath] = dataObj;
    slugMap[slug] = dataObj;
  }

  return pageData;
}

export function findBySlug(slug: string) {
  return slugMap[slug];
}

export function getAllPageData() {
  return pageData;
}

await populatePageData();
startWatching();

export default pageData;
