"use client";

import { MDXContent } from "mdx/types";
import ExportedImage from "next-image-export-optimizer";

export interface MarkdownContentProps {
  Content: MDXContent;
}

export default async function MarkdownContent({ Content }: MarkdownContentProps) {
  return (
    <Content
      components={{
        ExportedImage,
      }}
    />
  );
}
