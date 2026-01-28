import { Metadata } from "next";
import ExportedImage from "next-image-export-optimizer";

import formatContent from "@/lib/markdown";
import { findBySlug, getAllPageData } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";

import PageHeader from "../components/pageheader";

export const dynamicParams = false;

type Props = {
  params: Promise<RouteData>;
};

type RouteData = {
  slug: string;
};

export async function generateStaticParams() {
  const pageData = getAllPageData();
  return pageData.map(
    ({ frontmatter: { slug } }) =>
      ({
        slug,
      }) satisfies RouteData,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = findBySlug(slug)!;

  return getPageMetadata(pageData.frontmatter.title);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const pageData = findBySlug(slug)!;

  const Content = await formatContent(pageData.content);

  const heroImage =
    pageData.frontmatter.heroImage ?
      <ExportedImage src={pageData.frontmatter.heroImage} alt="Hero Image" className="my-4 rounded-md" fill />
    : null;

  return (
    <article>
      <PageHeader title={pageData.frontmatter.title} heroImage={heroImage} />
      <main className="content-container">
        <div className="prose prose-neutral prose-headings:font-serif prose-h1:text-neutral-700 prose-a:text-emerald-600 prose-a:after:inline-block prose-a:link-external:link-arrow prose-a:after:text-xs prose-a:no-underline prose-a:hover:underline mx-auto max-w-none md:w-lg lg:w-3xl">
          <Content />
        </div>
      </main>
    </article>
  );
}
