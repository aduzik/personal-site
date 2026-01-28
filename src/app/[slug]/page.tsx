import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import { Metadata } from "next";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { findBySlug, getAllPageData } from "@/lib/pages";
import { getPageMetadata } from "@/lib/siteData";

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

    const { default: Content } = await evaluate(pageData.content, {
        ...runtime,
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex],
    });

    return (
        <div>
            <h1>{pageData.frontmatter.title}</h1>
            {pageData.excerpt && <p>Excerpt: {pageData.excerpt}</p>}
            <Content />
        </div>
    );
}
