import path from "path";
import url from "url";
import * as runtime from "react/jsx-runtime";
import YouTube from "@/app/components/youtube";
import { evaluate } from "@mdx-js/mdx";
import rehypeFigure from "@microflash/rehype-figure";
import type { Root } from "hast";
import type { Root as MdRoot } from "mdast";
import { MDXComponents, MDXContent } from "mdx/types";
import ExportedImage from "next-image-export-optimizer";
import { StaticImageData } from "next/image";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

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

  const file = new VFile({
    path: filePath,
    value: content,
    cwd: root,
  });
  const { default: Content } = await evaluate(file, {
    ...runtime,
    baseUrl: url.pathToFileURL(filePath).href,
    remarkPlugins: [remarkGfm, remarkMath, remarkSmartypants, [resolveImageSrc, { contentRoot }]],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      rehypeKatex,
      addLeadClass,
      rehypeFigure,
      [rehypePrismPlus, { showLineNumbers: true }],
      [rehypeCallouts, { theme: "github" }],
    ],
  });

  return Content;
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
      <div className="inline-block aspect-video overflow-clip rounded-lg shadow-xl shadow-neutral-600/50">
        <YouTube {...props} />
      </div>
    </div>
  ),
};
