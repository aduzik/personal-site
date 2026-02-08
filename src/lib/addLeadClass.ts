import type { Root } from "hast";
import { visit } from "unist-util-visit";

export function addLeadClass(options: { className?: string }) {
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
