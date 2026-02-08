## Repo overview

- This is a Next.js (App Router) TypeScript site that sources content from the local `content/` folder (MDX). Server and
  build logic lives in `src/app` and content-processing helpers live in `src/lib`.

## Big picture

- Content lives in `content/pages` and `content/posts` and is parsed at runtime/build using the utilities in
  `src/lib/pages.ts` and `src/lib/content.ts`.
- MDX is compiled via `src/lib/markdown.tsx` which applies many remark/rehype plugins (katex, prism, sectionize, custom
  image resolution). When working on MDX rendering, inspect `formatContent()` in `src/lib/markdown.tsx`.
- Pages and articles are rendered from `src/app/[[...slug]]/page.tsx` and `src/app/articles/*` routes. Feeds are
  generated server-side in `src/app/feeds/[feedType]/route.tsx`.

## Build / dev / debug

- Start dev server: `npm run dev` (alias for `next dev`).
- Build: `npm run build` which runs `next build && next-image-export-optimizer` (note image optimizer runs after build).
- Lint: `npm run lint`.
- The site uses Next 16 (App Router) + `next-image-export-optimizer` and `sharp`; builds may require native build tools
  for `sharp`.

## Project-specific conventions

- Content root: `content/`. Code imports content via the path alias `@content/*` (see `tsconfig.json` paths).
- Item system: content is exposed through a custom item API built with `createItemType()` in `src/lib/content.ts`. Use
  `getAllPageItems()` / `findPageBySlug()` from `src/lib/pages.ts` when adding content-driven features.
- MDX components: `formatContent()` injects default components (e.g., `img` -> `ExportedImage`) and attaches a generated
  `tableOfContents`. To add or override MDX components, pass `components` to `formatContent()` (example in
  `src/app/[[...slug]]/page.tsx`).
- Image paths inside MDX are rewritten relative to `content/` by a plugin in `markdown.tsx`. When referencing images in
  MDX, use paths relative to the file and rely on `@content/*` alias for imports in code.

## Common pitfalls & tips

- Don't assume MDX runs only client-side: `src/app/feeds/*` renders MDX server-side (`ssr: true`) and uses
  `react-dom/server` streams — ensure components used in SSR are safe.
- The content watcher (`createWatcher()` in `src/lib/pages.ts`) populates in-memory lists at process start. Changing
  watcher behavior requires editing `createWatcher` in `src/lib/content.ts`.
- When adding new remark/rehype plugins, keep `formatContent()`'s `ssr` parameter and `createDefaultComponents()`
  behavior in mind (some components differ between SSR and client).

## Files to inspect for changes or examples

- Site layout and header: `src/app/layout.tsx` and `src/app/components/siteheader.tsx`.
- Page rendering: `src/app/[[...slug]]/page.tsx` and `src/app/articles/*/page.tsx`.
- MDX compilation: `src/lib/markdown.tsx` (plugin list, default components).
- Content item API & watcher: `src/lib/content.ts` and `src/lib/pages.ts`.
- Feeds and SSR rendering: `src/app/feeds/[feedType]/route.tsx`.

## How to help

- If an instruction needs to reference additional build nuances (CI, vercel settings, or environment variables), tell me
  where they live and I'll update this file.

---

Please review and tell me if you'd like more examples (small code snippets) or references to specific lines/files.
