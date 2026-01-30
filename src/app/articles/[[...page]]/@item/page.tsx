import path from "path";
import PageHeader from "@/app/components/pageheader";
import Prose from "@/app/components/prose";
import ExportedImage from "next-image-export-optimizer";
import { StaticImageData } from "next/image";
import Link from "next/link";

import formatContent, { defaultComponents } from "@/lib/markdown";
import { findPostsBySlug, getNextPost, getPreviousPost } from "@/lib/pages";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function ArticlePage({ params }: PageProps<"/articles/[[...page]]">) {
  const { page } = await params;
  if (typeof page === "undefined" || page.length !== 1) return null;

  const slug = page[0];
  if (!isNaN(parseInt(slug))) return null;

  const post = findPostsBySlug(slug);
  if (!post) return null;

  let heroImage: React.ReactNode | null = null;
  if (post.frontmatter.heroImage) {
    const packageRoot = process.cwd();
    const imageAbsolutePath = path.resolve(path.dirname(post.filePath), post.frontmatter.heroImage);
    const imageRelativePath = path.relative(packageRoot, imageAbsolutePath);

    const importImage = (await import(`/public/images/${imageRelativePath}`)).default as StaticImageData;

    heroImage = <ExportedImage src={importImage} alt="" fill />;
  }

  const Content = await formatContent(post.content, {
    filePath: post.filePath,
  });

  const nextPost = getNextPost(post);
  const previousPost = getPreviousPost(post);

  return (
    <article className="grow flex flex-col">
      <PageHeader title={post.frontmatter.title} heroImage={heroImage}>
        <p className="text-sm text-gray-600 text-shadow-xs text-shadow-white">
          Published on {dateFormat.format(new Date(post.frontmatter.date))}
        </p>
      </PageHeader>
      <main className="content-container grow">
        <Prose>
          <Content components={defaultComponents} />
        </Prose>
      </main>
      {(nextPost || previousPost) && (
        <footer className="content-container mb-8 mt-4">
          <div className="flex flex-row justify-between">
            {nextPost ?
              <Link
                href={`/articles/${nextPost.frontmatter.slug}`}
                className="text-emerald-700 hover:underline link-backward"
              >
                {nextPost.frontmatter.title}
              </Link>
            : <div />}
            {previousPost ?
              <Link
                href={`/articles/${previousPost.frontmatter.slug}`}
                className="text-emerald-700 hover:underline link-forward"
              >
                {previousPost.frontmatter.title}
              </Link>
            : <div />}
          </div>
        </footer>
      )}
    </article>
  );
}
