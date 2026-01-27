import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import { } from '@mdx-js/react';

export type PageFrontmatter = {
    title: string;
    slug: string;
}

export type PageData = {
    frontmatter: PageFrontmatter
    filePath: string;
    content: string;
}

async function getPageData() {
    const contentDir = path.resolve(process.cwd(), 'src/page-content')
    const mdxFilePaths = await fs.readdir(contentDir, {
        recursive: true,
        withFileTypes: true,
    });

    const pageData: PageData[] = [];

    for (const entry of mdxFilePaths.filter(e => e.isFile())) {
        const isMDX = /\.mdx?$/.test(entry.name);
        if (!isMDX) continue;

        const filePath = path.join(entry.parentPath, entry.name);
        const fileContent = await fs.readFile(filePath, {
            encoding: 'utf-8',
            flag: 'r',
        });

        const frontmatter = matter(fileContent);

        pageData.push({
            frontmatter: frontmatter.data as PageFrontmatter,
            filePath,
            content: frontmatter.content,
        });
    }

    return pageData;
}

const pageData = await getPageData();

export function findBySlug(slug: string) {
    return pageData.find(page => page.frontmatter.slug === slug);
}

export default pageData;