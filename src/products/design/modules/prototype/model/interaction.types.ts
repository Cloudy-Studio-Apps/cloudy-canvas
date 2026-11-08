/** What starts an interaction in the player. */
export type PrototypeTrigger =
  "click" | "hover" | "press" | "enter" | "leave" | "drag" | "key" | "delay";

/** What an interaction does. */
export type PrototypeAction = "navigate" | "back" | "overlay" | "swap" | "close" | "link";

/** How the screen or overlay an interaction shows comes in. */
export type PrototypeAnimation =
  "instant" | "dissolve" | "move-in" | "move-out" | "push" | "slide-in" | "slide-out";

/** Where things move: `left`, the new screen comes in from the right. */
export type PrototypeDirection = "left" | "right" | "up" | "down";

export type PrototypeEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";

/** Where an overlay sits on the screen under it. */
export type OverlayPosition = "top" | "center" | "bottom";

export interface PrototypeTransition {
  animation: PrototypeAnimation;
  /** Used by `move-in`, `move-out`, `push`, `slide-in` and `slide-out`. */
  direction: PrototypeDirection;
  /** Milliseconds, 0–5000. */
  duration: number;
  easing: PrototypeEasing;
}

/** How an overlay (or a swap's) shows: its place, and whether a click outside closes it and it dims. */
export interface PrototypeOverlay {
  position: OverlayPosition;
  closeOutside: boolean;
  dim: boolean;
}

/** What a layer (or a screen itself) does in the player: a trigger, an action and a transition. */
export interface PrototypeInteraction {
  /** `createId()`. */
  id: string;
  trigger: PrototypeTrigger;
  /** Trigger `key`: a `KeyboardEvent.key`, compared case-insensitively. */
  key?: string;
  /** Trigger `delay`: milliseconds after the screen shows, 0–60000. */
  delay?: number;
  action: PrototypeAction;
  /** `navigate`, `overlay`, `swap`: a screen's id. */
  to?: string;
  /** `link`: an `http:` or `https:` address only. */
  url?: string;
  transition: PrototypeTransition;
  /** `overlay`, `swap`. */
  overlay?: PrototypeOverlay;
}
