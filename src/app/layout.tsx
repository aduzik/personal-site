import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getPageMetadata } from "@/lib/siteData";

export const metadata: Metadata = getPageMetadata();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <nav>
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/about">About</Link>
                        </li>
                    </ul>
                </nav>
                {children}
            </body>
        </html>
    );
}
