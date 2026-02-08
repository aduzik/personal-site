import fs from "fs/promises";
import path from "path";

export interface ItemTypeOptions<T> {
  rootPath: string;
  matchPath: RegExp;
  getItem(relativePath: string): Promise<T>;
  getItemMetdata(item: T): ItemMetadata;
  sortOptions?: {
    compare(a: T, b: T): number;
    order?: "asc" | "desc";
  };
}

export interface ItemMetadata {
  slug: string;
}

type ItemTypeReturn<Type extends string, T> = {
  type: Type;
  match(path: string): boolean;
  populate(path: string): Promise<void>;
  getAll(): T[];
  findBySlug(slug: string): T | null;
  findByFilePath(filePath: string): T | null;
  sort(): void;
  removeByFilePath(filePath: string): void;
};

type AnyItemTypeReturn = ItemTypeReturn<string, unknown>;

export type ItemFunctions<Type extends string, T> = {
  [type in Type as `getAll${Capitalize<Type>}Items`]: ItemTypeReturn<Type, T>["getAll"];
} & {
  [type in Type as `find${Capitalize<Type>}BySlug`]: ItemTypeReturn<Type, T>["findBySlug"];
} & {
  [type in Type as `find${Capitalize<Type>}ByFilePath`]: ItemTypeReturn<Type, T>["findByFilePath"];
};

export function getItemFunctions<Type extends string, T>(functions: ItemTypeReturn<Type, T>): ItemFunctions<Type, T> {
  const { type, getAll, findBySlug, findByFilePath } = functions;

  return {
    [`getAll${type.charAt(0).toUpperCase() + type.slice(1)}Items`]: getAll,
    [`find${type.charAt(0).toUpperCase() + type.slice(1)}BySlug`]: findBySlug,
    [`find${type.charAt(0).toUpperCase() + type.slice(1)}ByFilePath`]: findByFilePath,
  } as ItemFunctions<Type, T>;
}

export function createItemType<Type extends string, T>(
  type: Type,
  options: ItemTypeOptions<T>,
): ItemTypeReturn<Type, T> {
  const items: T[] = [];
  const slugMap: Map<string, T> = new Map();
  const filePathMap: Map<string, T> = new Map();

  const functions: ItemTypeReturn<Type, T> = {
    type,
    match(filePath: string): boolean {
      return filePath.toLowerCase().startsWith(options.rootPath.toLowerCase()) && options.matchPath.test(filePath);
    },
    async populate(relativePath: string): Promise<void> {
      const item = await options.getItem(relativePath);
      items.push(item);
      const metadata = options.getItemMetdata(item);
      slugMap.set(metadata.slug, item);
      filePathMap.set(relativePath, item);
    },
    getAll(): T[] {
      return items;
    },
    findBySlug(slug: string): T | null {
      // Implementation to find an item by slug
      return slugMap.get(slug) || null;
    },
    findByFilePath(filePath: string): T | null {
      // Implementation to find an item by file path
      return filePathMap.get(filePath) || null;
    },
    sort(): void {
      if (options.sortOptions) {
        const { compare, order = "asc" } = options.sortOptions;
        items.sort((a, b) => {
          const result = compare(a, b);
          return order === "desc" ? -result : result;
        });
      }
    },
    removeByFilePath(filePath: string): void {
      const item = filePathMap.get(filePath);
      if (item) {
        filePathMap.delete(filePath);
        const metadata = options.getItemMetdata(item);
        slugMap.delete(metadata.slug);
        const index = items.indexOf(item);
        if (index !== -1) {
          items.splice(index, 1);
        }
      }
    },
  };

  return functions;
}

export interface Watcher {
  watchItem<Type extends string, T>(itemType: ItemTypeReturn<Type, T>): Watcher;
  start(): Promise<void>;
}

export interface WatcherOptions {
  root?: string;
  contentRoot?: string;
}

class FileWatcher implements Watcher {
  private itemTypes: AnyItemTypeReturn[] = [];
  private started: boolean = false;
  private abortController: AbortController | undefined;

  constructor(private options: WatcherOptions = {}) {}

  watchItem<Type extends string, T>(itemType: ItemTypeReturn<Type, T>): Watcher {
    if (this.started) throw new Error("Cannot watch new item types after the watcher has started.");

    this.itemTypes.push(itemType);
    return this;
  }

  async start(): Promise<void> {
    if (this.started) throw new Error("Watcher has already been started.");
    this.started = true;

    const root = this.options.root || process.cwd();
    const contentRoot = this.options.contentRoot || path.join(root, "content");

    const entries = await fs.readdir(contentRoot, {
      recursive: true,
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const absolutePath = path.join(entry.parentPath, entry.name);
      const relativePath = path.relative(root, absolutePath);

      for (const itemType of this.itemTypes) {
        if (itemType.match(relativePath)) {
          await itemType.populate(relativePath);
          break;
        }
      }
    }

    // don't await this.watch() to keep the watcher running
    this.watch();
  }

  private async watch() {
    const root = this.options.root || process.cwd();
    const contentRoot = this.options.contentRoot || path.join(root, "content");

    const abortController = new AbortController();
    this.abortController = abortController;
    const changes = fs.watch(contentRoot, { recursive: true, signal: abortController.signal });

    for await (const change of changes) {
      const { filename } = change;
      if (!filename) continue;

      const absolutePath = path.join(root, filename);
      const relativePath = path.relative(root, absolutePath);

      for (const itemType of this.itemTypes) {
        if (itemType.match(relativePath)) {
          await itemType.populate(relativePath);
          break;
        }
      }
    }
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
      this.started = false;
    }
  }
}

export function createWatcher(options?: WatcherOptions): Watcher {
  return new FileWatcher(options ?? {});
}
