import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStatus,
} from "@floating-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twJoin, twMerge } from "tailwind-merge";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const {
    context,
    refs: { setReference, setFloating },
  } = useFloating<HTMLDivElement>({
    placement: "bottom",
    strategy: "fixed",
    transform: false,
    open,
    onOpenChange: setOpen,
  });

  const click = useClick(context, {
    toggle: true,
  });

  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
    ancestorScroll: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const { status } = useTransitionStatus(context, {
    duration: 750,
  });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const stylesheet = document.createElement("style");
    document.head.appendChild(stylesheet);

    const updateNavHeight = () => {
      const navHeight = nav.getBoundingClientRect().height;
      console.log("navHeight", navHeight);
      stylesheet.textContent = `:root { --nav-height: ${navHeight}px; }`;
    };

    const resizeObserver = new ResizeObserver(() => {
      updateNavHeight();
    });

    requestAnimationFrame(() => {
      updateNavHeight();
    });

    resizeObserver.observe(nav);
    return () => {
      resizeObserver.unobserve(nav);
      stylesheet.remove();
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const listItems = nav.querySelectorAll<HTMLLIElement>("li");
    listItems.forEach((item, index) => {
      item.style.setProperty("--index", index.toString());
    });
  });

  const onClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const nav = navRef.current;
    if (!nav) return;

    if (nav.contains(event.target as Node)) setOpen(false);
  }, []);

  return (
    <div className="mx-2">
      <HamburgerButton className="md:hidden" ref={setReference} {...getReferenceProps()} expanded={open} />
      <div
        ref={setFloating}
        {...getFloatingProps()}
        className={twJoin(
          "group/nav fixed top-(--site-header-height) right-0 left-0 z-20 overflow-hidden bg-white/50 backdrop-blur-lg dark:bg-black/10",
          "md:static md:w-auto md:bg-transparent md:shadow-none md:backdrop-blur-none md:transition-none dark:md:bg-transparent",
          "h-0 transition-[height] duration-750 data-[transition=closed]:h-0 data-[transition=open]:h-(--nav-height) md:h-auto",
        )}
        data-transition={status}
      >
        <nav
          className="overflow-visible"
          ref={navRef}
          style={
            {
              "--index": "0",
            } as React.CSSProperties
          }
          onClick={onClick}
        >
          <ul className="block md:flex md:flex-row md:gap-x-1">
            <li>
              <NavBarLink href="/articles" text="Articles" tooltipContent="Read my latest articles" />
            </li>
            <li>
              <NavBarLink href="/about" text="About" tooltipContent="Learn more about me" />
            </li>
            <li>
              <NavBarLink href="/contact" text="Contact" tooltipContent="Get in touch with me" />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

type NavBarLinkProps = {
  href: string;
  text: string;
  tooltipContent?: React.ReactNode;
};

function NavBarLink({ href, text, tooltipContent }: NavBarLinkProps) {
  const [open, setOpen] = useState(false);
  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    placement: "bottom",
    strategy: "fixed",
    transform: false,
    open,
    onOpenChange: setOpen,
    middleware: [offset(8)],
  });

  const hover = useHover(context, {
    mouseOnly: true,
    restMs: 200,
    delay: {
      close: 500,
    },
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const { isMounted, status } = useTransitionStatus(context, {
    duration: 150,
  });

  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <span
      className={twJoin(
        "relative block px-4 leading-none md:mr-4 md:inline-block md:px-0 md:py-0",
        "-translate-y-4 opacity-0 transition-[opacity,transform,translate,rotate,scale] duration-500 ease-out group-data-[transition=open]/nav:translate-y-0 group-data-[transition=open]/nav:opacity-100 group-data-[transition=open]/nav:delay-[calc(var(--index)*150ms+250ms)]",
        "md:translate-y-0 md:opacity-100 md:transition-none",
      )}
      ref={setReference}
      {...getReferenceProps()}
    >
      <Link
        href={href}
        className="group block"
        aria-current={isActive ? "true" : undefined}
        aria-expanded={open ? "true" : undefined}
      >
        <span
          className={twJoin(
            "relative inline-block py-2 text-emerald-700 text-shadow-black/10 dark:text-emerald-500 dark:text-shadow-2xs",
            "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-70 after:bg-emerald-600 after:opacity-0 after:content-['']",
            "group-hover:after:scale-x-100 group-hover:after:opacity-100 group-hover:after:transition-transform group-hover:after:duration-300 group-aria-[expanded]:after:scale-x-100 group-aria-[expanded]:after:opacity-100",
          )}
        >
          <span
            className={
              "inline-block p-2 text-center group-aria-[current]:font-semibold after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-content)]"
            }
            data-content={text}
          >
            {text}
          </span>
        </span>
      </Link>
      {tooltipContent && isMounted && (
        <FloatingPortal>
          <div
            ref={setFloating}
            style={floatingStyles}
            className={twJoin(
              "z-20 max-w-64 -translate-y-2 rounded-2xl bg-white/80 p-4 opacity-0 shadow-lg backdrop-blur-lg dark:bg-black/0",
              "transition-[opacity,transform,translate,scale,rotate] data-[transition=open]:translate-y-0 data-[transition=open]:opacity-100",
            )}
            {...getFloatingProps()}
            data-transition={status}
          >
            <div className="flex flex-col items-center justify-center">{tooltipContent}</div>
          </div>
        </FloatingPortal>
      )}
    </span>
  );
}

export type HamburgerButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  expanded?: boolean;
};

const HamburgerButton = React.forwardRef<HTMLButtonElement, HamburgerButtonProps>(function HamburgerButton(
  { expanded, className, ...props },
  ref,
) {
  const expandedRef = useRef(expanded);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const duration = expandedRef.current === expanded ? 0 : 300;
    expandedRef.current = expanded;

    const topLine = button.querySelector("i:nth-child(1)");
    const middleLine = button.querySelector("i:nth-child(2)");
    const bottomLine = button.querySelector("i:nth-child(3)");

    topLine?.animate(
      [
        { transform: "translateY(0px) rotate(0deg)" },
        { transform: "translateY(5px) rotate(0deg)" },
        { transform: "translateY(5px) rotate(45deg)" },
      ],
      {
        duration,
        fill: "forwards",
        direction: expanded ? "normal" : "reverse",
        easing: "ease-in-out",
      },
    );
    middleLine?.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 0 }], {
      duration,
      fill: "forwards",
      direction: expanded ? "normal" : "reverse",
      easing: "ease-in-out",
    });
    bottomLine?.animate(
      [
        { transform: "translateY(0px) rotate(0deg)" },
        { transform: "translateY(-5px) rotate(0deg)" },
        { transform: "translateY(-5px) rotate(-45deg)" },
      ],
      {
        duration,
        fill: "forwards",
        direction: expanded ? "normal" : "reverse",
        easing: "ease-in-out",
      },
    );
  }, [expanded]);

  return (
    <button
      {...props}
      aria-expanded={expanded ? "true" : undefined}
      ref={buttonRef}
      className={twMerge("-mx-2 inline-flex h-8 w-8 flex-col items-center justify-center p-2", className)}
    >
      <span className="@container relative inline-block h-3 w-4">
        <i className={["absolute inset-x-0 top-0 block h-0.5 origin-center rounded-full bg-neutral-600"].join(" ")} />
        <i className="absolute inset-x-0 top-1/2 -mt-px block h-0.5 origin-center rounded-full bg-neutral-600" />
        <i className="absolute inset-x-0 bottom-0 block h-0.5 origin-center rounded-full bg-neutral-600" />
      </span>
      <span className="sr-only">Toggle menu</span>
    </button>
  );
});
