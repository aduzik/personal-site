import pageData, { findBySlug } from "@/lib/pages";
import { MDXRemote } from "next-mdx-remote/rsc";

export const dynamicParams = false;

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

export default async function Page({ params }: { params: Promise<RouteData> }) {
    const { slug } = await params;
    const pageData = findBySlug(slug)!;

    return (
        <div>
            <h1>{pageData.frontmatter.title}</h1>
            <MDXRemote source={pageData.content} />
        </div>
    );
}
