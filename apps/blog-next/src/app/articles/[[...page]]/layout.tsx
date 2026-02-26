import { getAllPostItems } from "@/lib/pages";

export async function generateStaticParams() {
  const itemsPerPage = 1;

  const allPosts = getAllPostItems();

  const pages: string[][] = [];

  const totalPages = Math.ceil(allPosts.length / itemsPerPage);

  Array.from({ length: totalPages }, (_, i) => {
    pages.push(i === 0 ? [] : [(i + 1).toString()]);
  });

  allPosts.forEach(({ frontmatter: { slug } }) => {
    pages.push([slug]);
  });

  return pages.map((page) => ({
    page,
  }));
}

export default async function ArticlesLayout({ children, list, item, params }: LayoutProps<"/articles/[[...page]]">) {
  const { page } = await params;

  const isListPage = typeof page === "undefined" || (page.length === 1 && !isNaN(parseInt(page[0])));

  return (
    <>
      {children}
      {isListPage ? list : item}
    </>
  );
}
