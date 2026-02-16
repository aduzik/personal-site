"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Prose({ children, className, ...props }: ProseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
    }
  }, [mounted]);

  useEffect(() => {
    const onWindowScroll = () => {
      const portal = portalRef.current;
      if (!portal) return;

      const scroll = document.documentElement.scrollTop || document.body.scrollTop;
      if (scroll > 500) {
        portal.setAttribute("data-scrolled", "true");
      } else {
        portal.removeAttribute("data-scrolled");
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      const portal = portalRef.current;
      const container = containerRef.current;
      if (!portal || !container) return;

      const { right } = container.getBoundingClientRect();

      portal.style.setProperty("--prose-right", `${right}px`);
    });

    window.addEventListener("scroll", onWindowScroll);
    resizeObserver.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      {...props}
      className={twMerge(
        "prose mb-8 max-w-full overflow-hidden prose-neutral prose-emerald dark:prose-invert prose-headings:font-serif prose-a:no-underline prose-a:after:inline-block prose-a:after:text-xs prose-a:hover:underline prose-a:link-external:link-arrow",
        "prose-headings:scroll-mt-[calc(var(--site-header-height)+1rem)] prose-a:scroll-mt-[calc(var(--site-header-height)+1rem)]",
        "prose-img:in-prose-figure:rounded prose-img:in-prose-figure:shadow-lg prose-img:in-prose-figure:shadow-neutral-500/50 dark:prose-img:in-prose-figure:shadow-black/50",
        "prose-figure:overflow-x-auto prose-pre:overflow-x-auto prose-pre:text-xs",
        "[counter-reset:figure] prose-figcaption:[counter-increment:figure] prose-figcaption:before:font-semibold prose-figcaption:before:content-['Figure_'counter(figure)'._']",
        className,
      )}
      ref={containerRef}
    >
      {children}
    </div>
  );
}
