import type { OverlayEntry, PlayerState } from "../../model";

/** What the player shows: the session, and how many times it began (Restart, a lost screen). */
export interface PlayerView {
  state: PlayerState;
  /** Counts the session's beginnings, so a restart on the same screen shows it afresh. */
  epoch: number;
}

/** An overlay's two layers on the stage: the screen and the backdrop under it. */
export interface OverlayParts {
  page: HTMLElement;
  backdrop: HTMLElement;
}

/** What a step plays on: the stage's DOM, the session's commit and the pictures. */
export interface StepContext {
  /** Shows the next state at once (synchronously), so its DOM can be animated. */
  commit: (next: PlayerState) => void;
  /** Draws a screen's picture before it shows (a failure shows on the screen itself). */
  preload: (screen: string) => Promise<void>;
  /** The empty layer under the screen where a copy of the old screen plays its way out. */
  ghost: () => HTMLElement | null;
  /** The screen under the overlays. */
  base: () => HTMLElement | null;
  overlay: (entry: OverlayEntry) => OverlayParts | null;
}
