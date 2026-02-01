import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import PageHeader from "@/app/components/pageheader";
import articlesHero from "@/assets/articles.jpg";
import { getAllPostItems } from "@/lib/pages";

import Preview from "./components/preview";

export const dynamicParams = false;

const pageSize = 12;

async function getPageNumber(params: PageProps<"/articles/[[...page]]">["params"]): Promise<number | null> {
  const { page: pageParam } = await params;

  if (typeof pageParam === "undefined") return 1;
  if (pageParam.length !== 1) return null;

  const currentPage = parseInt(pageParam[0]);
  return isNaN(currentPage) ? null : currentPage;
}

export default async function ArticleListPage({ params }: PageProps<"/articles/[[...page]]">) {
  const currentPage = await getPageNumber(params);
  if (!currentPage) return null;

  const posts = getAllPostItems();

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  return (
    <section className="flex grow flex-col">
      <PageHeader title="Articles" heroImage={<ExportedImage src={articlesHero} alt="" fill preload />} />
      <div className="content-container flex grow flex-col justify-between">
        <main className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {paginatedPosts.map((post) => (
            <Preview key={post.frontmatter.slug} post={post} />
          ))}
          {/* {paginatedPosts.map((post) => (
          //   <article key={post.frontmatter.slug} className="mb-8">
          //     <h2 className="text-2xl font-bold mb-2 font-serif">
          //       <a href={`/articles/${post.frontmatter.slug}`} className="text-emerald-700 hover:underline">
          //         {post.frontmatter.title}
          //       </a>
          //     </h2>
          //     <p className="text-gray-600 text-sm mb-4">{new Date(post.frontmatter.date).toLocaleDateString()}</p>
          //     <p>{post.excerpt}</p>
          //   </article>
          // ))}
          {/* Pagination Controls */}
        </main>
        <footer className="mt-8 flex justify-between">
          {currentPage > 1 ?
            <Link
              href={`/articles${currentPage > 2 ? `?p=${currentPage - 1}` : ""}`}
              className={[
                "text-emerald-700 hover:underline",
                "before:mr-1 before:inline-block before:content-['«']",
                "hover:before:-translate-x-1 hover:before:transition-transform",
              ].join(" ")}
            >
              Newer Posts
            </Link>
          : <div />}
          {endIndex < posts.length ?
            <Link
              href={`/articles/${currentPage + 1}`}
              className={[
                "text-emerald-700 hover:underline",
                "after:ml-1 after:inline-block after:content-['»']",
                "hover:after:translate-x-1 hover:after:transition-transform",
              ].join(" ")}
            >
              Older Posts
            </Link>
          : <div />}
        </footer>
      </div>
    </section>
  );
}
