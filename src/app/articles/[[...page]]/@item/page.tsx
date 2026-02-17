import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import PageContent from "@/app/components/pagecontent";
import PageHeader from "@/app/components/pageheader";
import { importImage } from "@/lib/images";
import formatContent from "@/lib/markdown";
import { findPostBySlug, getNextPost, getPreviousPost } from "@/lib/pages";

import { dateFormat } from "../util";

export default async function ArticlePage({ params }: PageProps<"/articles/[[...page]]">) {
  const { page } = await params;
  if (typeof page === "undefined" || page.length !== 1) return null;

  const slug = page[0];
  if (!isNaN(parseInt(slug))) return null;

  const post = findPostBySlug(slug);
  if (!post) return null;

  let heroImage: React.ReactNode | null = null;
  if (post.frontmatter.heroImage) {
    const image = await importImage(post.frontmatter.heroImage, post.filePath);

    heroImage = image && <ExportedImage src={image} alt="" fill />;
  }

  const { default: Content, tableOfContents } = await formatContent(post.content, {
    filePath: post.filePath,
  });

  const nextPost = getNextPost(post);
  const previousPost = getPreviousPost(post);

  return (
    <article className="flex grow flex-col">
      <PageHeader title={post.frontmatter.title} heroImage={heroImage}>
        <p className="text-sm">Published on {dateFormat.format(new Date(post.frontmatter.date))}</p>
      </PageHeader>
      <PageContent
        tableOfContents={tableOfContents}
        contentFooter={
          (nextPost || previousPost) && (
            <div className="mt-4 mb-8">
              <div className="flex flex-row justify-between">
                {nextPost ?
                  <Link
                    href={`/articles/${nextPost.frontmatter.slug}`}
                    className="link-backward text-emerald-700 hover:underline dark:text-emerald-500"
                  >
                    {nextPost.frontmatter.title}
                  </Link>
                : <div />}
                {previousPost ?
                  <Link
                    href={`/articles/${previousPost.frontmatter.slug}`}
                    className="link-forward text-emerald-700 hover:underline dark:text-emerald-500"
                  >
                    {previousPost.frontmatter.title}
                  </Link>
                : <div />}
              </div>
            </div>
          )
        }
      >
        <Content />
      </PageContent>
    </article>
  );
}
