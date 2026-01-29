import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    loader: "custom",
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  transpilePackages: ["next-image-export-optimizer"],
  env: {
    nextImageExportOptimizer_imageFolderPath: "public/images",
    nextImageExportOptimizer_exportFolderPath: "out",
    nextImageExportOptimizer_quality: "75",
    nextImageExportOptimizer_storePicturesInWEBP: "true",
    nextImageExportOptimizer_exportFolderName: "nextImageExportOptimizer",
    nextImageExportOptimizer_generateAndUseBlurImages: "true",
    nextImageExportOptimizer_remoteImageCacheTTL: "0",
  },
  serverExternalPackages: ["remark-prism"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(process.cwd(), "src/page-content"),
              to: path.resolve(process.cwd(), "public/images/page-content"),
              globOptions: {
                ignore: ["**/*.md", "**/*.mdx"],
              },
            },
          ],
        }),
      );
    }
    // config.module.rules.push({
    //   test: /\.(png|jpe?g|gif|webp|avif|svg)$/i,
    //   type: "asset/resource",
    //   generator: {
    //     filename: "images/[name]-[hash][ext]",
    //   },
    // });
    return config;
  },
};

export default nextConfig;
