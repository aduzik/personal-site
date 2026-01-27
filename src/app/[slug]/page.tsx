import pageData, { findBySlug } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

export const dynamicParams = false;

type Props = {
    params: Promise<RouteData>;
};

type RouteData = {
    slug: string;
};

export async function generateStaticParams() {
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

    return (
        <div>
            <h1>{pageData.frontmatter.title}</h1>
            {pageData.excerpt && <p>Excerpt: {pageData.excerpt}</p>}
            <MDXRemote source={pageData.content} />
        </div>
    );
}
