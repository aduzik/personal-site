import { Metadata } from "next";

import { findPostBySlug } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";

import { getPageNumber, isListPage } from "./util";

export const dynamicParams = false;

async function ArticleIndexPage() {
  return null;
}

export async function generateMetadata({ params }: PageProps<"/articles/[[...page]]">): Promise<Metadata> {
  const { page } = await params;
  if (isListPage(page)) {
    const pageNumber = getPageNumber(page);
    return getPageMetadata(!pageNumber ? "Articles" : `Articles - Page ${pageNumber}`);
  } else if (typeof page !== "undefined" && page.length === 1) {
    const post = findPostBySlug(page[0]);
    if (post) {
      return getPageMetadata(post.frontmatter.title);
    }
  }

  return getPageMetadata("Articles");
}

export default ArticleIndexPage;
