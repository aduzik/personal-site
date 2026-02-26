import type { Element, RootContent } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";

function isElement(node: RootContent): node is Element {
  return node.type === "element";
}

export function svgElementFromRaw(svgText: string): Element {
  const fragment = fromHtmlIsomorphic(svgText, { fragment: true });

  const svg = fragment.children.find((n): n is Element => isElement(n) && n.tagName === "svg");

  if (!svg) throw new Error("Expected an <svg> root element in icon markup.");

  // Optional: add attributes/classes for styling/accessibility
  svg.properties = {
    ...(svg.properties ?? {}),
    "aria-hidden": "true",
    focusable: "false",
  };

  return svg;
}
