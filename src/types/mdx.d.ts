import "mdx/types";

import { Toc } from "@stefanprobst/rehype-extract-toc";

declare module "mdx/types" {
  interface MDXModule {
    /**
     * The table of contents extracted from the MDX file.
     */
    tableOfContents?: Toc;
  }
}
