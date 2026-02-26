import path from "path";
import { StaticImageData } from "next/image";

export async function importImage(src: string, pagePath: string | undefined = undefined) {
  try {
    const srcPath = pagePath ? path.resolve(path.dirname(pagePath), src) : src;
    const contentPath = path.join(process.cwd(), "content");
    const relativeSrcPath = path.relative(contentPath, srcPath);

    path.resolve(path.dirname(pagePath || ""), src);
    const imageModule = (await import(`@content/${relativeSrcPath}`)) as { default: StaticImageData };
    return imageModule.default;
  } catch (error) {
    console.error(`Error importing image ${src}:`, error);
    return null;
  }
}
