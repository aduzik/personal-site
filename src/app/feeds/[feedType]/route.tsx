import { Feed } from "feed";

import authorInfo from "@/lib/authorInfo";
import { getAllPostItems } from "@/lib/pages";
import siteMetadata from "@/lib/siteData";

import "next";

import { NextRequest } from "next/server";

import formatContent from "@/lib/markdown";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ feedType: "rss" }, { feedType: "atom" }, { feedType: "feed.json" }];
}

export async function GET(_request: NextRequest, { params }: RouteContext<"/feeds/[feedType]">): Promise<Response> {
  const { feedType } = await params;

  let feedURL = "";
  switch (feedType) {
    case "rss":
      feedURL = "rss";
      break;
    case "atom":
      feedURL = "atom";
      break;
    case "feed.json":
      feedURL = "feed.json";
      break;
    default:
      return new Response("Not Found", { status: 404 });
  }

  const feed = new Feed({
    title: siteMetadata.title,
    description: siteMetadata.description,
    author: {
      name: authorInfo.name,
      email: authorInfo.email,
      link: authorInfo.url,
    },
    copyright: siteMetadata.copyright,
    id: `${siteMetadata.url}/feeds/${feedURL}`,
    link: siteMetadata.url,
    feedLinks: {
      rss: `${siteMetadata.url}/feeds/rss`,
      atom: `${siteMetadata.url}/feeds/atom`,
      json: `${siteMetadata.url}/feeds/feed.json`,
    },
  });

  const allPosts = getAllPostItems();
  const { renderToReadableStream } = await import("react-dom/server");

  for (const post of allPosts.slice(0, 10)) {
    const Content = await formatContent(post.content, {
      filePath: post.filePath,
      ssr: true,
    });

    const stream = await renderToReadableStream(<Content />);
    await stream.allReady;

    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");

    let description = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      console.log(chunk);
      description += chunk;
    }

    const itemURL = `${siteMetadata.url}/articles/${post.frontmatter.slug}`;

    feed.addItem({
      title: post.frontmatter.title,
      author: [
        {
          name: authorInfo.name,
          email: authorInfo.email,
          link: authorInfo.url,
        },
      ],
      id: itemURL,
      description: post.excerpt,
      content: description,
      link: itemURL,
      date: new Date(post.frontmatter.date),
    });
  }

  return (() => {
    switch (feedType) {
      case "rss":
        return new Response(feed.rss2(), {
          headers: {
            "Content-Type": "application/rss+xml",
          },
        });
      case "atom":
        return new Response(feed.atom1(), {
          headers: {
            "Content-Type": "application/atom+xml",
          },
        });
      case "feed.json":
        return new Response(feed.json1(), {
          headers: {
            "Content-Type": "application/feed+json",
          },
        });
      default:
        return new Response("Not Found", { status: 404 });
    }
  })();
}
