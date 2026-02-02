"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twJoin, twMerge } from "tailwind-merge";

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
        "mx-auto prose mb-8 max-w-none prose-neutral prose-emerald dark:prose-invert prose-headings:font-serif prose-a:no-underline prose-a:after:inline-block prose-a:after:text-xs prose-a:hover:underline prose-a:link-external:link-arrow",
        "prose-img:in-prose-figure:rounded prose-img:in-prose-figure:shadow-lg prose-img:in-prose-figure:shadow-neutral-500/50 dark:prose-img:in-prose-figure:shadow-black/50",
        "prose-pre:overflow-x-auto",
        "[counter-reset:figure] prose-figcaption:[counter-increment:figure] prose-figcaption:before:font-semibold prose-figcaption:before:content-['Figure_'counter(figure)'._']",
        className,
      )}
    >
      {children}
      {mounted &&
        createPortal(
          <div ref={portalRef} className="group/back-to-top">
            <div
              className={twJoin([
                "fixed bottom-0 z-10 opacity-0 transition-opacity duration-300 group-data-[scrolled=true]/back-to-top:opacity-100",
                "left-0 md:translate-x-[calc(var(--prose-right))]",
              ])}
            >
              <a
                href="#main-content"
                className={twJoin(
                  "m-4 inline-block p-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-600",
                  "before:mr-1 before:inline-block before:content-['↑'] hover:before:-translate-y-2 hover:before:transition-transform",
                  "invisible md:visible",
                )}
              >
                Back to top
              </a>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
