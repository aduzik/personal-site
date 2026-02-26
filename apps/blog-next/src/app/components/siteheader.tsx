"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { twJoin } from "tailwind-merge";

import siteData from "@/lib/siteData";

import NavBar from "./navbar";

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let headerHeight = 0;

    const stylesheet = document.createElement("style");
    document.head.appendChild(stylesheet);

    const observer = new ResizeObserver(() => {
      const { bottom } = header.getBoundingClientRect();
      headerHeight = bottom;

      stylesheet.textContent = `:root { --site-header-height: ${headerHeight}px; }`;
    });

    observer.observe(header);

    return () => {
      stylesheet.remove();
      observer.unobserve(header);
    };
  }, []);

  return (
    <header
      className={twJoin(
        "sticky top-0 z-20 shadow-sm",
        "before:absolute before:inset-0 before:bg-white/70 before:backdrop-blur-md before:dark:bg-black/20",
      )}
      ref={headerRef}
    >
      {/* eslint-disable-next-line tailwindcss/classnames-order */}
      <div className="relative content-container flex h-16 flex-row items-center justify-between gap-x-4 py-2 md:justify-normal">
        <h1 className="font-serif text-lg leading-none text-neutral-800 text-shadow-sm md:text-2xl dark:text-neutral-200">
          <Link href="/" className="inline-block px-2 py-1">
            {siteData.title}
          </Link>
        </h1>
        <NavBar />
      </div>
    </header>
  );
}
