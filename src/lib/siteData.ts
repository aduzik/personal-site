import { Metadata } from "next";

const siteData = {
    title: "Alex Duzik",
    description: "Personal website of Alex Duzik",
};

export function getPageMetadata(title?: string): Metadata {
    return {
        title: getPageTitle(title),
        description: siteData.description,
    };
}

export function getPageTitle(title?: string): string {
    return title ? `${title} - ${siteData.title}` : siteData.title;
}

export default siteData;
