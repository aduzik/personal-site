"use client";

import { useRef } from "react";
import Link from "next/link";

import siteData from "@/lib/siteData";

import NavBar from "./navbar";

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  return (
    <header className="sticky top-0 z-20 bg-white/70 shadow-sm backdrop-blur-md" ref={headerRef}>
      <div className="content-container flex h-16 flex-row items-center justify-between gap-x-4 py-2 md:justify-normal">
        <h1 className="font-serif text-lg leading-none text-neutral-800 md:text-2xl">
          <Link href="/" className="inline-block px-2 py-1">
            {siteData.title}
          </Link>
        </h1>
        <NavBar headerRef={headerRef} />
      </div>
    </header>
  );
}
