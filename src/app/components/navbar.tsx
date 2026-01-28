import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  arrow,
  FloatingArrow,
  FloatingPortal,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStatus,
} from "@floating-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export type NavBarProps = {
  headerRef?: React.RefObject<HTMLElement | null>;
};

const NavBarContext = React.createContext({
  responsive: false,
});

export default function NavBar({ headerRef }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const [responsive, setResponsive] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(min-width: 768px)");

    setResponsive(!mediaQueryList.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setResponsive(!e.matches);
    };
    mediaQueryList.addEventListener("change", onChange);

    return () => {
      mediaQueryList.removeEventListener("change", onChange);
    };
  }, []);

  const {
    context,
    refs: { setReference, setFloating, setPositionReference },
    floatingStyles,
    update,
    elements: { floating },
  } = useFloating<HTMLDivElement>({
    placement: "bottom",
    strategy: "fixed",
    transform: false,
    open,
    onOpenChange: setOpen,
    middleware: [
      size({
        apply({ availableWidth, elements }) {
          elements.floating.style.setProperty("--available-width", `${availableWidth}px`);
        },
      }),
    ],
  });

  const click = useClick(context, {
    toggle: true,
    enabled: responsive,
  });

  const dismiss = useDismiss(context, {
    enabled: responsive,
    outsidePress: true,
    escapeKey: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const { isMounted, status } = useTransitionStatus(context, {
    duration: 750,
  });

  useEffect(() => {
    const header = headerRef?.current;
    if (!header) return;

    const resizeObserver = new ResizeObserver((entries) => {
      setPositionReference({
        getBoundingClientRect() {
          return entries[0].contentRect;
        },
      });
    });

    resizeObserver.observe(header);

    return () => {
      resizeObserver.unobserve(header);
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!floating || !nav || !isMounted) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const navHeight = entries[0].contentRect.height;
      setNavHeight(navHeight);
    });

    resizeObserver.observe(nav);
    return () => {
      resizeObserver.unobserve(nav);
    };
  }, [floating, isMounted]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const listItems = nav.querySelectorAll<HTMLLIElement>("li");
    listItems.forEach((item, index) => {
      item.style.setProperty("--index", index.toString());
    });
  });

  const navBarContent: React.ReactNode = (
    <div
      ref={setFloating}
      {...(responsive ? getFloatingProps() : {})}
      style={
        responsive ?
          ({
            ...floatingStyles,
            "--nav-height": `${navHeight}px`,
          } as React.CSSProperties)
        : undefined
      }
      className={[
        "group/nav z-10 w-(--available-width) overflow-hidden bg-white/50 shadow-lg backdrop-blur-lg",
        "md:w-auto md:bg-transparent md:shadow-none md:backdrop-blur-none",
        "h-0 transition-[height] duration-750 data-[transition=closed]:h-0 data-[transition=open]:h-(--nav-height) md:h-auto",
      ].join(" ")}
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
  );

  return (
    <NavBarContext.Provider value={{ responsive }}>
      <div className="mx-2">
        <HamburgerButton className="md:hidden" ref={setReference} {...getReferenceProps()} expanded={open} />
        {responsive ? isMounted && <FloatingPortal>{navBarContent}</FloatingPortal> : navBarContent}
      </div>
    </NavBarContext.Provider>
  );
}

type NavBarLinkProps = {
  href: string;
  text: string;
  tooltipContent?: React.ReactNode;
};

function NavBarLink({ href, text, tooltipContent }: NavBarLinkProps) {
  const [open, setOpen] = useState(false);
  const arrowRef = React.useRef<SVGSVGElement>(null);
  const { responsive } = useContext(NavBarContext);
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
    middleware: [
      arrow({
        element: arrowRef,
      }),
      offset(8),
    ],
  });

  const hover = useHover(context, {
    enabled: !responsive,
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
      className={[
        "relative block px-2 py-2 leading-none md:inline-block md:py-0",
        "-translate-y-4 opacity-0 transition-[opacity,transform,translate,rotate,scale] duration-500 ease-out group-data-[transition=open]/nav:translate-y-0 group-data-[transition=open]/nav:opacity-100 group-data-[transition=open]/nav:delay-[calc(var(--index)*150ms+250ms)]",
        "md:translate-y-0 md:opacity-100",
      ].join(" ")}
      ref={setReference}
      {...getReferenceProps()}
    >
      <Link
        href={href}
        className="group"
        aria-current={isActive ? "true" : undefined}
        aria-expanded={open ? "true" : undefined}
      >
        <span
          className={[
            "relative inline-block py-2 text-emerald-700",
            "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-emerald-600 after:content-['']",
            "group-hover:after:scale-x-100 group-hover:after:transition-transform group-hover:after:duration-300 group-aria-[expanded]:after:scale-x-100 group-aria-[expanded]:after:opacity-100",
          ].join(" ")}
        >
          <span
            className={
              "inline-block text-center group-aria-[current]:font-semibold after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-content)]"
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
            className="z-20 max-w-64 -translate-y-2 rounded-2xl bg-white/80 p-4 opacity-0 shadow-lg backdrop-blur-lg transition-[opacity,transform,translate,scale,rotate] data-[transition=open]:translate-y-0 data-[transition=open]:opacity-100"
            {...getFloatingProps()}
            data-transition={status}
          >
            <FloatingArrow context={context} ref={arrowRef} className="fill-white/80" />
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

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
        duration: 300,
        fill: "forwards",
        direction: expanded ? "normal" : "reverse",
        easing: "ease-in-out",
      },
    );
    middleLine?.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 0 }], {
      duration: 300,
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
        duration: 300,
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
      className={twMerge("inline-flex h-8 w-8 flex-col items-center justify-center", className)}
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
