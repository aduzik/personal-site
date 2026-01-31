import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";

import { importImage } from "@/lib/images";
import { Post } from "@/lib/pages";

import { dateFormat } from "../../util";

export interface PreviewProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  post: Post;
}

export default async function Preview({ post, ...props }: PreviewProps) {
  let heroImage: React.ReactNode = null;
  if (post.frontmatter.heroImage) {
    const image = await importImage(post.frontmatter.heroImage, post.filePath);

    heroImage = image && (
      <ExportedImage
        className="col-span-full row-span-full object-cover relative brightness-80 group-hover:brightness-90 transition-all"
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
          <div className="group grid mb-4 bg-neutral-200 rounded-md overflow-hidden h-48 relative shadow-sm shadow-black/60">
            {heroImage}
            <div className="col-span-full row-span-full flex flex-col justify-end p-4 z-20">
              <h2 className="text-2xl font-bold font-serif text-white text-shadow-sm text-shadow-black/40 group-hover:underline">
                {post.frontmatter.title}
              </h2>
            </div>
          </div>
        </Link>
        <p className="text-gray-600 text-sm mb-4">{dateFormat.format(new Date(post.frontmatter.date))}</p>
        <p>{post.excerpt}</p>
      </header>
    </article>
  );
}
