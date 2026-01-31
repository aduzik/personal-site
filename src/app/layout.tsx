import type { Metadata } from "next";

import "./globals.css";

import chicagoFlag from "@/assets/chicagoflag.svg";
import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import siteData, { getPageMetadata } from "@/lib/siteData";

import SiteHeader from "./components/siteheader";

export const metadata: Metadata = getPageMetadata();

export type RootLayoutProps = React.HTMLAttributes<HTMLElement>;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex grow flex-col">{children}</main>
          <footer className="mt-auto pt-8">
            <div className="content-container flex flex-row justify-between pb-4 text-sm text-neutral-600">
              <div>
                Copyright &copy; {new Date().getFullYear()} {siteData.title}
              </div>
              <div>
                Made with ❤️ in{" "}
                <Link
                  href="https://medium.com/@robertloerzel/the-story-of-chicagos-four-star-city-flag-4042dc579cb2"
                  title="Chicago"
                >
                  <ExportedImage
                    src={chicagoFlag}
                    alt="Chicago Flag"
                    height={24}
                    width={36}
                    className="inline-block"
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
