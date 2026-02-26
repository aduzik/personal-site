export const SITE_HEADER_RESIZE = "siteheader:resize" as const;
export type SiteHeaderResize = {
  bottom: number;
};
export type SiteHeaderResizeEvent = CustomEvent<SiteHeaderResize>;

export function getSiteHeader(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-site-header]");
}

export function getHeaderSize(): number | null {
  const header = getSiteHeader();
  if (!header) return null;

  const { bottom } = header.getBoundingClientRect();
  return bottom;
}

const siteHeader = document.querySelector<HTMLElement>("[data-site-header]");
if (siteHeader) {
  const updateHeaderSize = () => {
    const { bottom } = siteHeader.getBoundingClientRect();

    siteHeader.dispatchEvent(
      new CustomEvent<SiteHeaderResize>(SITE_HEADER_RESIZE, {
        bubbles: true,
        detail: {
          bottom,
        },
      }),
    );
  };

  const resizeObserver = new ResizeObserver(() => {
    updateHeaderSize();
  });

  resizeObserver.observe(siteHeader);
  updateHeaderSize();
}
