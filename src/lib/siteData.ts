import { Metadata } from "next";

const siteData = {
  title: "Alex Duzik",
  description: "Personal website of Alex Duzik",
  url: "https://aduzik.com",
  copyright: `© 2022-${new Date().getFullYear()} Alex Duzik`,
};

export interface MetadataOptions {
  linkRSSFeed?: boolean;
}

export function getPageMetadata(title?: string, options: MetadataOptions = {}): Metadata {
  const { linkRSSFeed = false } = options;

  const metadata: Metadata = {
    title: getPageTitle(title),
    description: siteData.description,
  };

  if (linkRSSFeed) {
    metadata.alternates = {
      types: {
        "application/rss+xml": [
          {
            url: `${siteData.url}/feeds/rss`,
            title: "aduzik.com RSS Feed",
          },
        ],
        "application/atom+xml": [
          {
            url: `${siteData.url}/feeds/atom`,
            title: "aduzik.com Atom Feed",
          },
        ],
        "application/feed+json": [
          {
            url: `${siteData.url}/feeds/feed.json`,
            title: "aduzik.com JSON Feed",
          },
        ],
      },
    };
  }

  return metadata;
}

export function getPageTitle(title?: string): string {
  return title ? `${title} - ${siteData.title}` : siteData.title;
}

export default siteData;
