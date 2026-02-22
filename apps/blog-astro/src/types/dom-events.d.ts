import type { NavStateEvent } from "../scripts/nav-controller";
import type { SiteHeaderResizeEvent } from "../scripts/siteheader-controller";

export {};

declare global {
  interface HTMLElementEventMap {
    "nav:state": NavStateEvent;
    "siteheader:resize": SiteHeaderResizeEvent;
  }
}
