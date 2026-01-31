import fs from "fs/promises";
import path from "path";
import url from "url";
import matter from "gray-matter";

export interface Item<TFrontmatter extends Frontmatter> {
  filePath: string;
  relativePath: string;
  baseUrl: string;
  content: string;
  excerpt?: string;
  frontmatter: TFrontmatter;
}

type AnyItem = Item<Frontmatter>;

export interface Frontmatter {
  title: string;
  slug: string;
  heroImage?: string;
}

export interface PageFrontmatter extends Frontmatter {}

export interface Page extends Item<Frontmatter> {}

export interface PostFrontmatter extends Frontmatter {
  date: string;
}

export interface Post extends Item<PostFrontmatter> {}

interface ItemDataFactory<TItem extends AnyItem> {
  (relativePath: string): Promise<TItem>;
}

type ItemMetadataFn<TMetadata extends AnyItemTypeMetadata, TArgs extends any[] = []> = (
  itemMap: ItemMap<TMetadata>,
  ...args: TArgs
) => void;
type SortMetadataFn<TMetadata extends AnyItemTypeMetadata> = ItemMetadataFn<TMetadata, [boolean]>;

interface ItemTypeMetadata<TypeName extends string, ItemData extends AnyItem> {
  type: TypeName;
  pathMatch: RegExp;
  getItem: ItemDataFactory<ItemData>;
  sort?: SortMetadataFn<ItemTypeMetadata<TypeName, ItemData>>;
}

type AnyItemTypeMetadata = ItemTypeMetadata<string, AnyItem>;

type ItemMetadataTypesOf<T> =
  T extends ReadonlyArray<infer U> ?
    U extends AnyItemTypeMetadata ?
      U
    : never
  : never;

type ItemTypeNamesOf<T> =
  T extends ReadonlyArray<infer U> ?
    U extends ItemTypeMetadata<infer Type, AnyItem> ?
      Type
    : never
  : never;

type ArrayElementOf<T> = T extends Array<infer U> ? U : never;

type ItemSortOptions<ItemType extends AnyItem> = {
  compare: (itemA: ItemType, itemB: ItemType) => number;
  reverse?: boolean;
};

function makeItemType<Type extends string, ItemTypeData extends AnyItem>(
  name: Type,
  pathMatch: RegExp,
  getItem: ItemDataFactory<ItemTypeData>,
  sortOptions: ItemSortOptions<ItemTypeData> | undefined = undefined,
): ItemTypeMetadata<Type, ItemTypeData> {
  let sort: ItemMetadataFn<ItemTypeMetadata<Type, ItemTypeData>> | undefined = undefined;
  if (sortOptions) {
    const { compare, reverse = false } = sortOptions;
    sort = (itemMap: ItemMap<ItemTypeMetadata<Type, ItemTypeData>>) => {
      const items = itemMap[name];
      items.sort(compare);
      if (reverse) {
        items.reverse();
      }
    };
  }

  return {
    type: name,
    pathMatch,
    getItem,
    sort,
  };
}

function makeItemTypes<T extends AnyItemTypeMetadata>(items: readonly T[]): readonly T[] {
  return items;
}

const contentPath = path.resolve(process.cwd(), "content");
const pagesPathMatch = /^pages[\/\\](.*)/;
const postsPathMatch = /^posts[\/\\](.*)/;

const itemTypes = makeItemTypes([
  makeItemType("pages", pagesPathMatch, getPageData),
  makeItemType("posts", postsPathMatch, getPostData, { compare: comparePostsByDate, reverse: true }),
]);

type MetadataTypeNames<T extends AnyItemTypeMetadata> = T["type"];

type MappedType<T extends AnyItemTypeMetadata> = {
  [Type in T["type"]]: unknown;
};

type ItemMap<T extends AnyItemTypeMetadata> = {
  [Type in MetadataTypeNames<T>]: Array<ExtractItemType<T, Type>>;
};

type ExtractItemType<T extends AnyItemTypeMetadata, TypeName extends T["type"]> =
  Extract<T, { type: TypeName }> extends ItemTypeMetadata<TypeName, infer TItem> ? TItem : never;

type SlugMap<T extends AnyItemTypeMetadata> = {
  [Type in keyof MappedType<T>]: {
    [slug: string]: ExtractItemType<T, Type>;
  };
};

type FilenameMap<T extends AnyItemTypeMetadata> = {
  [Type in keyof MappedType<T>]: {
    [filename: string]: ExtractItemType<T, Type>;
  };
};

type ItemGetters<T extends AnyItemTypeMetadata> = {
  [Type in MetadataTypeNames<T> as `get${Capitalize<Type>}`]: () => ItemMap<T>[Type];
};

type SlugGetters<T extends AnyItemTypeMetadata> = {
  [Type in MetadataTypeNames<T> as `find${Capitalize<Type>}BySlug`]: (
    slug: string,
  ) => SlugMap<T>[Type][string] | undefined;
};

type ItemMetadataTypes = ItemMetadataTypesOf<typeof itemTypes>;
type ItemTypeNames = ItemTypeNamesOf<typeof itemTypes>;

function makeItemMap<T extends AnyItemTypeMetadata>(itemTypes: readonly T[]): ItemMap<T> {
  const map = {} as ItemMap<T>;

  for (const itemType of itemTypes) {
    map[itemType.type as T["type"]] = [];
  }
  return map;
}

function makeSlugMap<T extends AnyItemTypeMetadata>(itemTypes: readonly T[]): SlugMap<T> {
  type ThisSlugMap = SlugMap<T>;
  const map = {} as ThisSlugMap;

  for (const itemType of itemTypes) {
    map[itemType.type as T["type"]] = {} as any;
  }
  return map;
}

function makeFilenameMap<T extends AnyItemTypeMetadata>(itemTypes: readonly T[]): FilenameMap<T> {
  type ThisFilenameMap = FilenameMap<T>;
  const map = {} as ThisFilenameMap;

  for (const itemType of itemTypes) {
    map[itemType.type as T["type"]] = {} as any;
  }
  return map;
}

function makeItemMapGetters<TMetadata extends AnyItemTypeMetadata>(
  itemTypes: readonly TMetadata[],
  itemMap: ItemMap<TMetadata>,
): ItemGetters<TMetadata> {
  const getters = {} as ItemGetters<TMetadata>;

  for (const itemType of itemTypes) {
    const key = itemType.type as TMetadata["type"];
    const functionName = `get${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof ItemGetters<TMetadata>;
    getters[functionName] = (() => {
      return itemMap[key];
    }) as ItemGetters<TMetadata>[typeof functionName];
  }

  return getters;
}

function makeSlugGetters<TMetadata extends AnyItemTypeMetadata>(
  itemTypes: readonly TMetadata[],
  slugMap: SlugMap<TMetadata>,
) {
  const getters = {} as SlugGetters<TMetadata>;

  for (const itemType of itemTypes) {
    const key = itemType.type as TMetadata["type"];
    const functionName = `find${key.charAt(0).toUpperCase() + key.slice(1)}BySlug` as keyof typeof getters;
    getters[functionName] = ((slug: string) => {
      return slugMap[key][slug];
    }) as (typeof getters)[typeof functionName];
  }

  return getters;
}

const itemMap = makeItemMap(itemTypes);
const slugMap = makeSlugMap(itemTypes);
const filenameMap = makeFilenameMap(itemTypes);

async function getItemData<TFrontmatter extends Frontmatter>(relativePath: string): Promise<Item<TFrontmatter>> {
  const filePath = path.join(contentPath, relativePath);
  const fileContent = await fs.readFile(filePath, {
    encoding: "utf-8",
    flag: "r",
  });

  const {
    data: frontmatter,
    content,
    excerpt,
  } = matter(fileContent, {
    excerpt: true,
    excerpt_separator: "{/* excerpt */}",
  });

  const pageFrontmatter = frontmatter as TFrontmatter;
  //   if (pageFrontmatter.heroImage) {
  //     const fileDirectory = path.dirname(filePath);
  //     const heroAbsolutePath = path.resolve(fileDirectory, pageFrontmatter.heroImage);
  //     const heroPath = path.relative(process.cwd(), heroAbsolutePath);
  //     pageFrontmatter.heroImage = heroPath;
  //   }

  return {
    frontmatter: pageFrontmatter,
    filePath,
    relativePath,
    baseUrl: url.pathToFileURL(filePath).href,
    content,
    excerpt,
  };
}

async function getPageData(relativePath: string): Promise<Page> {
  const page = await getItemData<PageFrontmatter>(relativePath);
  return page;
}

async function getPostData(relativePath: string): Promise<Post> {
  const post = await getItemData<PostFrontmatter>(relativePath);
  return post;
}

function comparePostsByDate(a: Post, b: Post): number {
  const dateA = new Date(a.frontmatter.date);
  const dateB = new Date(b.frontmatter.date);
  return dateA.getTime() - dateB.getTime();
}

async function startWatching() {
  const abortController = new AbortController();
  const fileWatcher = fs.watch(contentPath, {
    encoding: "utf-8",
    recursive: true,
    signal: abortController.signal,
  });

  for await (const event of fileWatcher) {
    switch (event.eventType) {
      case "change": {
        if (!event.filename) break;

        await populateItemData(event.filename);
        break;
      }

      case "rename": {
        break;
      }
    }
    console.log("Page content changed, rebuilding...");
  }

  abortController.abort();
}

async function populateAllItemData() {
  const mdxFilePaths = await fs.readdir(contentPath, {
    recursive: true,
    withFileTypes: true,
  });

  for (const entry of mdxFilePaths.filter((e) => e.isFile())) {
    const isMDX = /\.mdx?$/.test(entry.name);
    if (!isMDX) continue;

    const filePath = path.join(entry.parentPath, entry.name);
    const relativePath = path.relative(contentPath, filePath);

    await populateItemData(relativePath, { sort: false });
  }

  for (const itemType of itemTypes) {
    if (itemType.sort) {
      itemType.sort(itemMap);
    }
  }

  // console.log(
  //   "Posts order",
  //   itemMap["posts"].map((p) => p.frontmatter.slug),
  // );
}

async function populateItemData(relativePath: string, options: { sort?: boolean } = { sort: true }) {
  for (const itemType of itemTypes) {
    if (!itemType.pathMatch.test(relativePath)) continue;

    // remove any existing file with the name name
    removeByFilename(itemType.type, relativePath);

    const item = await itemType.getItem(relativePath);

    itemMap[itemType.type].push(item as any);
    slugMap[itemType.type][item.frontmatter.slug] = item;
    filenameMap[itemType.type][relativePath] = item;

    if (options.sort && itemType.sort) {
      itemType.sort(itemMap);
    }
  }
}

export function findBySlug<T extends ItemTypeNames>(
  itemType: T,
  slug: string,
): SlugMap<ItemMetadataTypes>[T][string] | undefined {
  type ItemType = SlugMap<ItemMetadataTypes>[T][string];
  return slugMap[itemType][slug] as ItemType | undefined;
}

export function findByFilename<T extends ItemTypeNames>(
  itemType: T,
  filename: string,
): FilenameMap<ItemMetadataTypes>[T][string] | undefined {
  type ItemType = FilenameMap<ItemMetadataTypes>[T][string];
  return filenameMap[itemType][filename] as ItemType | undefined;
}

function removeByFilename<T extends ItemTypeNames>(itemType: T, filename: string): void {
  const item = findByFilename(itemType, filename);
  if (!item) return;

  const index = itemMap[itemType].indexOf(item);
  if (index !== -1) {
    itemMap[itemType].splice(index, 1);
  }

  delete slugMap[itemType][item.frontmatter.slug];
  delete filenameMap[itemType][filename];
}

await populateAllItemData();
startWatching();

const getters = makeItemMapGetters(itemTypes, itemMap);
const slugGetters = makeSlugGetters(itemTypes, slugMap);

const { getPages, getPosts: getAllPosts } = getters;
const { findPagesBySlug, findPostsBySlug } = slugGetters;

const getAllPages = (excludeIndex: boolean = true) => {
  const pages = getPages();
  if (excludeIndex) {
    return pages.filter((page) => page.frontmatter.slug !== "index");
  }
  return pages;
};

export function getNextPost(currentPost: Post): Post | null {
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((post) => post.frontmatter.slug === currentPost.frontmatter.slug);
  if (currentIndex === -1 || currentIndex === posts.length - 1) {
    return null;
  }
  return posts[currentIndex + 1];
}

export function getPreviousPost(currentPost: Post): Post | null {
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((post) => post.frontmatter.slug === currentPost.frontmatter.slug);
  if (currentIndex <= 0) {
    return null;
  }
  return posts[currentIndex - 1];
}

export { getAllPages, getAllPosts, findPagesBySlug, findPostsBySlug };
export default itemMap;
