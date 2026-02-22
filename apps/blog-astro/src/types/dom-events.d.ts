import { NavStateEvent } from '../scripts/nav-controller';

export { }

declare global {
  interface HTMLElementEventMap {
    "nav:state": NavStateEvent;
  }
}