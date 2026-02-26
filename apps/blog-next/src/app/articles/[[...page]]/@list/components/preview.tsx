import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import { importImage } from "@/lib/images";
import { Post } from "@/lib/pages";

import { formatDate } from "../../util";

export interface PreviewProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  post: Post;
}

export default async function Preview({ post, ...props }: PreviewProps) {
  let heroImage: React.ReactNode = null;
  if (post.frontmatter.heroImage) {
    const image = await importImage(post.frontmatter.heroImage, post.filePath);

    heroImage = image && (
      <ExportedImage
        className="relative col-span-full row-span-full object-cover brightness-80 transition-all group-hover:brightness-90"
        src={image}
        alt=""
        fill
      />
    );
  }

  return (
    <article {...props}>
      <header>
        <Link href={`/articles/${post.frontmatter.slug}`} className="block" aria-label={post.frontmatter.title}>
          <div className="group relative mb-4 grid h-48 overflow-hidden rounded-md bg-neutral-200 shadow-sm shadow-black/60">
            {heroImage}
            <div className="z-20 col-span-full row-span-full flex flex-col justify-end p-4">
              <h2 className="font-serif text-2xl font-bold text-white text-shadow-black/40 text-shadow-sm group-hover:underline">
                {post.frontmatter.title}
              </h2>
            </div>
          </div>
        </Link>
        <p className="mb-4 text-sm text-gray-600">{formatDate(post.frontmatter.date)}</p>
        <p>{post.frontmatter.summary ?? post.excerpt}</p>
      </header>
    </article>
  );
}
