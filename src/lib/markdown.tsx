import path from "path";
import url from "url";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import type { Root } from "hast";
import type { Root as MdRoot } from "mdast";
import { MDXComponents, MDXContent } from "mdx/types";
import ExportedImage from "next-image-export-optimizer";
import { StaticImageData } from "next/image";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";

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

function resolveImageSrc(options: { filePath: string; contentRoot: string }) {
  return (tree: MdRoot) => {
    visit(tree, "image", (node) => {
      const src = node.url;

      if (!src.startsWith("http")) {
        const absoluteSrcPath = path.resolve(path.dirname(options.filePath), src);
        const relativeSrcPath = path.relative(options.contentRoot, absoluteSrcPath);

        node.url = relativeSrcPath;

        // console.log("resolve image src", { src, absoluteSrcPath, relativeSrcPath, nodeUrl: node.url });
      }
    });
  };
}

export type FormatContentOptions = {
  filePath: string;
};

export default async function formatContent(content: string, options: FormatContentOptions): Promise<MDXContent> {
  const { filePath } = options;
  const root = process.cwd();
  const contentRoot = path.join(root, "src");

  // const jsx = await compile(content, {
  //   baseUrl,
  //   remarkPlugins: [remarkGfm, remarkMath, [resolveImageSrc, { filePath, contentRoot, imagesRoot: "/public/images" }]],
  //   rehypePlugins: [rehypeKatex, addLeadClass],
  // });
  // console.log(jsx);

  const { default: Content } = await evaluate(content, {
    ...runtime,
    baseUrl: url.pathToFileURL(filePath).href,
    remarkPlugins: [remarkGfm, remarkMath, [resolveImageSrc, { filePath, contentRoot }]],
    rehypePlugins: [rehypeKatex, addLeadClass],
  });

  return Content;
}

export const defaultComponents: MDXComponents = {
  img: async (props) => {
    const { src, width, height } = (await import(`/public/images/${props.src}`)).default as StaticImageData;

    const imageProps = {
      ...props,
      src,
      width,
      height,
    };

    return <ExportedImage {...imageProps} />;
  },
  ExportedImage,
};
