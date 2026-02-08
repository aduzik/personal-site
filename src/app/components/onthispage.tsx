"use client";

import { useEffect, useRef, useState } from "react";
import { Toc } from "@stefanprobst/rehype-extract-toc";
import { twJoin } from "tailwind-merge";

export interface OnThisPageProps extends React.HTMLAttributes<HTMLElement> {
  tableOfContents: Toc;
}
export default function OnThisPage({ tableOfContents }: OnThisPageProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>();
  const [siteHeaderHeight, setSiteHeaderHeight] = useState("0px");

  useEffect(() => {
    window.setTimeout(() => {
      const siteHeaderHeight = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--site-header-height");

      if (siteHeaderHeight.length > 0 && siteHeaderHeight.endsWith("px")) {
        setSiteHeaderHeight(siteHeaderHeight);
      }
    }, 0);

    const sectionIds = tableOfContents.filter((section) => typeof section.id === "string").map<string>(({ id }) => id!);
    if (sectionIds.length === 0) return;
    const entryMap = new Map<string, IntersectionObserverEntry>();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("id");
          if (!sectionId) return;

          entryMap.set(sectionId, entry);
        });

        const list = listRef.current;
        if (!list) return;

        let firstSectionId: string | null = null;

        for (const id of sectionIds) {
          const entry = entryMap.get(id);
          if (entry && entry.intersectionRatio > 0) {
            firstSectionId = id;
            break;
          }
        }

        setHighlightedSectionId(firstSectionId ?? highlightedSectionId ?? sectionIds[0]);
      },
      {
        threshold: 0.0,
        rootMargin: `-${siteHeaderHeight} 0px 0px 0px`,
      },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      intersectionObserver.observe(element);
    });

    return () => {
      intersectionObserver.disconnect();
    };
  }, [highlightedSectionId, siteHeaderHeight, tableOfContents]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    list.querySelectorAll("li").forEach((li) => {
      const sectionId = li.getAttribute("data-section-id");
      if (sectionId === highlightedSectionId) {
        li.setAttribute("aria-current", "true");

        const { top: listTop } = list.getBoundingClientRect();
        const { top: itemTop } = li.getBoundingClientRect();

        const indicatorTop = itemTop - listTop;
        list.style.setProperty("--indicator-top", `${indicatorTop}px`);
      } else {
        li.removeAttribute("aria-current");
      }
    });
  }, [highlightedSectionId]);

  return (
    <nav>
      <h5 className="data-active:bold mb-2 font-serif text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        On this page
      </h5>
      <ol
        ref={listRef}
        className={twJoin(
          "relative pl-6 text-sm text-neutral-800 dark:text-neutral-200",
          "before:absolute before:left-0 before:translate-y-(--indicator-top) before:leading-loose before:font-bold before:text-emerald-700 before:transition-transform before:content-['→'] dark:before:text-emerald-500",
        )}
      >
        {tableOfContents.map(({ id, value }) => (
          <li key={id} data-section-id={id} className="aria-current:font-bold dark:aria-current:text-neutral-100">
            <a href={`#${id}`} className="block leading-loose">
              {value}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
