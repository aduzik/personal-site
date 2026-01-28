import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import type { Root } from "hast";
import { MDXContent } from "mdx/types";
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

export default async function formatContent(content: string): Promise<MDXContent> {
  const { default: Content } = await evaluate(content, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex, addLeadClass],
  });

  return Content;
}
