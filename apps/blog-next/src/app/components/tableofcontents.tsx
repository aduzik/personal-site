"use client";

import type { Toc, TocEntry } from "@stefanprobst/rehype-extract-toc";
import { twMerge } from "tailwind-merge";

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLDivElement> {
  entries: Toc;
}

export default function TableOfContents({ entries, className, ...rest }: TableOfContentsProps) {
  return (
    <div className="mb-8 block">
      <div
        className={twMerge(
          "not-prose list-depth inline-block min-w-75 rounded-md border border-neutral-300 bg-neutral-50 px-4 py-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100",
          className,
        )}
        {...rest}
      >
        <h2 className="mb-2 border-b border-neutral-300 pb-2 font-serif text-base font-semibold text-neutral-800 dark:border-neutral-600 dark:text-neutral-100">
          On this page
        </h2>
        <div className="text-base md:text-sm">
          <EntryList entries={entries} additionalLevels={0} />
        </div>
      </div>
    </div>
  );
}

function EntryList({ entries, additionalLevels }: { entries: TocEntry[]; additionalLevels: number }) {
  return (
    <ol className="[counter-reset:section]">
      {entries.map(({ id, value, children }) => (
        <li key={id} className={"list-item"}>
          <a href={`#${id}`} className="inline-block py-0.5 text-emerald-700 hover:underline dark:text-emerald-500">
            {value}
          </a>
          {children && children.length > 0 && additionalLevels > 0 && (
            <EntryList entries={children} additionalLevels={additionalLevels - 1} />
          )}
        </li>
      ))}
    </ol>
  );
}
