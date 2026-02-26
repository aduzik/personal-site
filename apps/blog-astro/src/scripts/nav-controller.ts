export const NAV_STATE_EVENT = "nav:state" as const;
export type NavState = { open: boolean };
export type NavStateEvent = CustomEvent<NavState>;

function raiseEvent(root: HTMLElement, state: NavState) {
  root.dispatchEvent(
    new CustomEvent<NavState>(NAV_STATE_EVENT, {
      bubbles: true,
      detail: state,
    }),
  );
}

export function setOpen(root: HTMLElement, open: boolean) {
  root.dataset.navOpen = open.toString();

  if (!open) {
    root.dataset.transition = "close";
  } else {
    const siteHeader = document.getElementById(root.dataset.siteHeader!)!;
    const { bottom } = siteHeader.getBoundingClientRect();

    root.style.setProperty("--site-header-height", `${Math.round(bottom)}px`);
    root.dataset.transition = "open";
  }

  raiseEvent(root, {
    open,
  });
}

export function getOpen(root: HTMLElement): boolean {
  return root.dataset.navOpen === "true";
}

export function toggleOpen(root: HTMLElement) {
  setOpen(root, !getOpen(root));
}

function initNavBar(root: HTMLElement) {
  setOpen(root, false);

  document.addEventListener("click", () => {
    if (!getOpen(root)) return;
    setOpen(root, false);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!getOpen(root)) return;
      setOpen(root, false);
    },
    { passive: true },
  );

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!getOpen(root)) return;

    if (e.key === "Escape") {
      setOpen(root, false);
    }
  });
}

document.querySelectorAll<HTMLElement>("[data-navbar]").forEach((navBar) => initNavBar(navBar));

document.querySelectorAll<HTMLElement>("[data-toggle-nav]").forEach((toggler) => {
  const target = document.getElementById(toggler.dataset.toggleNav!)!;
  toggler.addEventListener("click", (e) => {
    toggleOpen(target);
    e.stopPropagation();
  });
});
