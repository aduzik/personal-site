import { Metadata } from "next";
import ExportedImage from "next-image-export-optimizer";
import { notFound } from "next/navigation";
import { twJoin, twMerge } from "tailwind-merge";

import { importImage } from "@/lib/images";
import formatContent from "@/lib/markdown";
import { findPageBySlug, getAllPageItems } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";

import OnThisPage from "../components/onthispage";
import PageHeader from "../components/pageheader";
import Prose from "../components/prose";
import TableOfContents from "../components/tableofcontents";

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

  const { default: Content, tableOfContents } = await formatContent(pageData.content, {
    filePath: pageData.filePath,
    components: {
      TableOfContents: ({ className, ...props }) => (
        <TableOfContents className={twMerge(className, "md:hidden")} {...props} />
      ),
    },
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
      <div className="md:grid md:place-items-center">
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_var(--container-3xs)] md:gap-x-4 lg:w-5xl">
          <main>
            <Prose>
              <Content />
            </Prose>
          </main>
          <aside>
            {tableOfContents && (
              <div className="top-[calc(var(--site-header-height)+1rem)] mt-8 hidden w-72 md:sticky">
                <OnThisPage tableOfContents={tableOfContents} />
              </div>
            )}
            <div className={twJoin(["fixed right-0 bottom-0"])}>
              <a
                href="#page-top"
                className={twJoin(
                  "m-4 inline-block p-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-600",
                  "before:mr-1 before:inline-block before:content-['↑'] hover:before:-translate-y-2 hover:before:transition-transform",
                )}
              >
                Back to top
              </a>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
