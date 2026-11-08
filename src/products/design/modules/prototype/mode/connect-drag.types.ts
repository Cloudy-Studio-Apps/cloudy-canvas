import type { Point } from "@canvas";

/** A link being dragged out of a layer, in world units. */
export interface ConnectDragState {
  /** The layer (or screen) the link starts from. */
  from: string;
  /** Where the line starts: the right middle of `from`. */
  start: Point;
  /** Where the pointer is. */
  at: Point;
  /** The screen it would link to if dropped now, `null` for none. */
  target: string | null;
}

/** What a finished drag added to `from`: a link to the screen `to`, or a Back when `to` is `null`. */
export interface ConnectDrop {
  from: string;
  to: string | null;
}
