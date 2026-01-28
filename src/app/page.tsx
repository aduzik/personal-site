// import { readFile } from "fs/promises";
// import path from "path";

// import formatMarkdown from "@/lib/markdown";

// export default async function Home() {
//   const pagePath = path.join(process.cwd(), "src", "page-content", "homepage.mdx");
//   const homePageContent = await readFile(pagePath, "utf-8");

//   const Content = await formatMarkdown(homePageContent);

//   return <Content />;
// }

import { getPageMetadata } from "@/lib/siteData";

import Page from "./[slug]/page";

export const metadata = getPageMetadata();

export default function IndexPage() {
  return <Page params={Promise.resolve({ slug: "index" })} searchParams={Promise.resolve({})} />;
}
