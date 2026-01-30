import { Metadata } from "next";
import ExportedImage from "next-image-export-optimizer";

import formatContent, { defaultComponents } from "@/lib/markdown";
import { findBySlug, getAllPages } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";

import PageHeader from "../components/pageheader";

export const dynamicParams = false;

export async function generateStaticParams() {
  const pageData = getAllPages(false);

  const staticParams = pageData.map(({ frontmatter: { slug } }) => ({
    slug: slug === "index" ? [] : [slug],
  }));

  console.log("Generating static params for pages:", staticParams);

  return staticParams;
}

async function getPageSlug(params: PageProps<"/[[...slug]]">["params"]): Promise<string | null> {
  const { slug } = await params;

  return (
    typeof slug === "undefined" ? "index"
    : slug.length === 1 ? slug[0]
    : null
  );
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const slug = await getPageSlug(params);

  let title: string | undefined = undefined;
  if (slug) {
    const pageData = findBySlug("pages", slug)!;
    title = pageData.frontmatter.title;
  }

  return getPageMetadata(title);
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const slug = await getPageSlug(params);
  console.log("Generating metadata for slug:", slug, await params);
  if (!slug) return null;

  const pageData = findBySlug("pages", slug)!;

  const Content = await formatContent(pageData.content, {
    filePath: pageData.filePath,
  });

  const heroImage =
    pageData.frontmatter.heroImage ?
      <ExportedImage src={pageData.frontmatter.heroImage} alt="Hero Image" className="my-4 rounded-md" fill />
    : null;

  return (
    <article>
      <PageHeader title={pageData.frontmatter.title} heroImage={heroImage} />
      <main className="content-container">
        <div
          className={[
            "prose prose-neutral prose-headings:font-serif prose-emerald prose-a:after:inline-block prose-a:link-external:link-arrow prose-a:after:text-xs prose-a:no-underline prose-a:hover:underline mx-auto max-w-none md:w-lg lg:w-3xl",
            "prose-img:in-prose-figure:rounded prose-img:in-prose-figure:shadow-lg prose-img:in-prose-figure:shadow-neutral-500/50",
            "[counter-reset:figure] prose-figcaption:[counter-increment:figure] prose-figcaption:before:content-['Figure_'counter(figure)'._'] prose-figcaption:before:font-semibold",
          ].join(" ")}
        >
          <Content components={defaultComponents} />
        </div>
      </main>
    </article>
  );
}
