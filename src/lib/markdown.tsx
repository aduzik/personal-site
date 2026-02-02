import path from "path";
import url from "url";
import React from "react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import { compile, run } from "@mdx-js/mdx";
import rehypeFigure from "@microflash/rehype-figure";
import rehypeExtractToc, { Toc, TocEntry } from "@stefanprobst/rehype-extract-toc";
import type { Root } from "hast";
import type { Root as MdRoot } from "mdast";
import { MDXComponents, MDXContent } from "mdx/types";
import ExportedImage from "next-image-export-optimizer";
import { StaticImageData } from "next/image";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

import TableOfContents, { TableOfContentsProps } from "@/app/components/tableofcontents";
import YouTube from "@/app/components/youtube";

function addLeadClass(options: { className?: string }) {
  const className = options?.className || "lead";
  return (tree: Root) => {
    let foundFirst = false;
    visit(tree, "element", (node) => {
      if (foundFirst) return;
      foundFirst = true;

      if (node.tagName === "p") {
        node.properties = node.properties ?? {};
        if (node.properties.className) {
          node.properties.className += ` ${className}`;
        } else {
          node.properties.className = className;
        }
      }
    });
  };
}

type ImageSrcOptions = {
  contentRoot: string;
};

const resolveImageSrc: Plugin<[ImageSrcOptions], MdRoot> = ({ contentRoot }) => {
  return (tree: MdRoot, file) => {
    visit(tree, "image", (node) => {
      const src = node.url;

      if (!src.startsWith("http")) {
        const absoluteSrcPath = file.dirname ? path.resolve(file.dirname, src) : src;
        const relativeSrcPath = path.relative(contentRoot, absoluteSrcPath);

        node.url = relativeSrcPath;
      }
    });
  };
};

export type FormatContentOptions = {
  filePath: string;
};

export default async function formatContent(content: string, options: FormatContentOptions): Promise<MDXContent> {
  const { filePath } = options;
  const root = process.cwd();
  const contentRoot = path.join(root, "content");

  // const jsx = await compile(content, {
  //   baseUrl,
  //   remarkPlugins: [remarkGfm, remarkMath, [resolveImageSrc, { filePath, contentRoot, imagesRoot: "/public/images" }]],
  //   rehypePlugins: [rehypeKatex, addLeadClass],
  // });
  // console.log(jsx);

  const mdxSource = new VFile({
    path: filePath,
    value: content,
    cwd: root,
  });
  const compiledSource = await compile(mdxSource, {
    baseUrl: url.pathToFileURL(filePath).href,
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm, remarkMath, remarkSmartypants, [resolveImageSrc, { contentRoot }]],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      rehypeKatex,
      addLeadClass,
      rehypeFigure,
      [rehypePrismPlus, { showLineNumbers: true }],
      [rehypeCallouts, { theme: "github" }],
      rehypeExtractToc,
    ],
  });

  const { default: Content } = await run(compiledSource, {
    ...runtime,
  });

  const components = {
    ...defaultComponents,
  } as MDXComponents;

  const { toc } = compiledSource.data;

  if (toc) {
    components.TableOfContents = withToc(pruneTOCEntries(toc)!);
  }

  return withComponents(Content, components);
}

// Higher-order components are passe, but since we can't use context in server-side components,
// it's simpler to create a compone that binds a sepcific ToC to a TableOfContents instance.
function withToc(entries: Toc) {
  return function TableOfContentsWithToc(props: Omit<TableOfContentsProps, "entries">) {
    return <TableOfContents entries={entries} {...props} />;
  };
}

function pruneTOCEntries(entries: TocEntry[] | undefined): TocEntry[] | undefined {
  if (!entries) return undefined;

  return entries
    .filter(({ id, depth }) => depth <= 2 && id !== "footnote-label")
    .map((entry) => ({
      ...entry,
      children: pruneTOCEntries(entry.children),
    }));
}

function withComponents(Component: MDXContent, defaultComponents: MDXComponents): MDXContent {
  return React.memo(function ContentWithComponents({ components, ...rest }) {
    return <Component {...rest} components={{ ...defaultComponents, ...components }} />;
  });
}

export const defaultComponents: MDXComponents = {
  img: async (props) => {
    const image = (await import(`@content/${props.src}`)).default as StaticImageData;

    const imageProps = {
      ...props,
      src: image,
    };

    return <ExportedImage {...imageProps} />;
  },
  ExportedImage,
  YouTube: (props) => (
    <div className="text-center">
      <div className="inline-block aspect-video overflow-clip rounded-lg shadow-lg shadow-neutral-600/50 dark:shadow-black/50">
        <YouTube {...props} />
      </div>
    </div>
  ),
};
