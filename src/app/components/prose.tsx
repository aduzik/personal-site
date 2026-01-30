import { twMerge } from "tailwind-merge";

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Prose({ children, className, ...props }: ProseProps) {
  return (
    <div
      {...props}
      className={twMerge(
        "prose prose-neutral prose-headings:font-serif prose-emerald prose-a:after:inline-block prose-a:link-external:link-arrow prose-a:after:text-xs prose-a:no-underline prose-a:hover:underline mx-auto max-w-none md:w-lg lg:w-3xl",
        "prose-img:in-prose-figure:rounded prose-img:in-prose-figure:shadow-lg prose-img:in-prose-figure:shadow-neutral-500/50",
        "[counter-reset:figure] prose-figcaption:[counter-increment:figure] prose-figcaption:before:content-['Figure_'counter(figure)'._'] prose-figcaption:before:font-semibold",
        className,
      )}
    >
      {children}
    </div>
  );
}
