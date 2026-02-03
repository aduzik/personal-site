"use client";

import { useEffect, useState } from "react";
import { Toc } from "@stefanprobst/rehype-extract-toc";
import { twJoin } from "tailwind-merge";

import OnThisPage from "./onthispage";
import Prose from "./prose";

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  tableOfContents?: Toc;
  contentFooter?: React.ReactNode;
}

export default function PageContent({ tableOfContents, children, contentFooter }: PageContentProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onWindowScroll = () => {
      const scroll = document.documentElement.scrollTop || document.body.scrollTop;
      setScrolled(scroll > 500);
    };

    window.addEventListener("scroll", onWindowScroll);
    return () => {
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, []);

  return (
    <div className="md:grid md:place-items-center">
      <div
        className="md:grid md:gap-x-4 md:data-has-toc:grid-cols-[minmax(0,1fr)_var(--container-3xs)] lg:w-5xl"
        data-has-toc={tableOfContents && tableOfContents.length > 0 ? "true" : undefined}
      >
        <div>
          <main>
            <Prose>{children}</Prose>
          </main>
          {contentFooter && <footer className="mb-8 px-4">{contentFooter}</footer>}
        </div>
        <aside className="md:flex md:flex-col">
          {tableOfContents && tableOfContents.length > 0 && (
            <div className="top-[calc(var(--site-header-height)+1rem)] mt-8 hidden w-72 md:sticky md:block">
              <OnThisPage tableOfContents={tableOfContents} />
            </div>
          )}
          <div
            className={twJoin(
              "fixed right-0 bottom-0 opacity-0 transition-opacity data-scrolled:opacity-100",
              "md:sticky md:mt-auto",
            )}
            data-scrolled={scrolled ? "true" : undefined}
          >
            <a
              href="#page-top"
              className={twJoin(
                "m-4 inline-block p-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-600",
                "before:mr-1 before:inline-block before:content-['↑'] hover:before:-translate-y-2 hover:before:transition-transform",
              )}
            >
              Back to top
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
