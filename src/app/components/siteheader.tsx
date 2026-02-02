"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import siteData from "@/lib/siteData";

import NavBar from "./navbar";

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let headerHeight = 0;

    const observer = new ResizeObserver(() => {
      const { bottom } = header.getBoundingClientRect();
      headerHeight = bottom;
    });

    const onLinkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName !== "A") return;

      const anchor = target as HTMLAnchorElement;
      if (!anchor.href || !anchor.hash) return;

      const element = document.getElementById(anchor.hash.substring(1));
      if (!element) return;

      event.preventDefault();

      setTimeout(() => {
        const elementRect = element.getBoundingClientRect();
        window.scrollTo({
          top: elementRect.top + window.scrollY - headerHeight - 8,
          behavior: "smooth",
        });
      }, 0);
    };

    observer.observe(header);
    document.body.addEventListener("click", onLinkClick);

    return () => {
      document.body.removeEventListener("click", onLinkClick);
      observer.unobserve(header);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/70 shadow-sm backdrop-blur-md dark:bg-black/20" ref={headerRef}>
      <div className="content-container flex h-16 flex-row items-center justify-between gap-x-4 py-2 md:justify-normal">
        <h1 className="font-serif text-lg leading-none text-neutral-800 text-shadow-sm md:text-2xl dark:text-neutral-200">
          <Link href="/" className="inline-block px-2 py-1">
            {siteData.title}
          </Link>
        </h1>
        <NavBar headerRef={headerRef} />
      </div>
    </header>
  );
}
