import type { Metadata } from "next";

import "./globals.css";

import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import chicagoFlag from "@/assets/chicagoflag.svg";
import siteData, { getPageMetadata } from "@/lib/siteData";

import SiteHeader from "./components/siteheader";

export const metadata: Metadata = getPageMetadata();

export type RootLayoutProps = React.HTMLAttributes<HTMLElement>;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="dark:bg-neutral-900 dark:text-neutral-200">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex grow flex-col" id="main-content">
            {children}
          </main>
          <footer className="mt-auto pt-8">
            <div className="content-container flex flex-row justify-between pb-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div>
                Copyright &copy; {new Date().getFullYear()} {siteData.title}
              </div>
              <div>
                Made with ❤️ in
                <Link
                  href="https://medium.com/@robertloerzel/the-story-of-chicagos-four-star-city-flag-4042dc579cb2"
                  title="Chicago"
                  className="inline-block"
                >
                  <ExportedImage
                    src={chicagoFlag}
                    alt="Chicago Flag"
                    height={24}
                    width={36}
                    className="ml-2 inline-block"
                    preload
                    placeholder="empty"
                  />
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
