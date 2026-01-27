import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
    output: "export",
    pageExtensions: ["tsx", "ts", "jsx", "js", "md", "mdx"],
};

const withMDX = createMDX({
    extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
