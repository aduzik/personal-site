import { Metadata } from "next";
import ExportedImage from "next-image-export-optimizer";
import { notFound } from "next/navigation";

import { importImage } from "@/lib/images";
import formatContent from "@/lib/markdown";
import { findPageBySlug, getAllPageItems } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";

import PageHeader from "../components/pageheader";
import Prose from "../components/prose";

export const dynamicParams = false;

export async function generateStaticParams() {
  const pageData = getAllPageItems();

  const staticParams = pageData.map(({ frontmatter: { slug } }) => ({
    slug: slug === "index" ? [] : [slug],
  }));

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
    const pageData = findPageBySlug(slug)!;
    title = pageData.frontmatter.title;
  }

  return getPageMetadata(title);
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const slug = await getPageSlug(params);
  if (!slug) return notFound();

  const pageData = findPageBySlug(slug);
  if (!pageData) return notFound();

  const Content = await formatContent(pageData.content, {
    filePath: pageData.filePath,
  });

  let heroImage: React.ReactNode | null = null;
  if (pageData.frontmatter.heroImage) {
    const image = await importImage(pageData.frontmatter.heroImage, pageData.filePath);
    if (image) {
      heroImage = <ExportedImage src={image} className="my-4 rounded-md" alt="Hero Image" fill />;
    }
  }

  return (
    <article>
      <PageHeader title={pageData.frontmatter.title} heroImage={heroImage} />
      <main className="content-container">
        <Prose>
          <Content />
        </Prose>
      </main>
    </article>
  );
}
