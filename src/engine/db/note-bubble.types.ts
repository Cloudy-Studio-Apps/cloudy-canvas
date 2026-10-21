import type { Rect } from "../geometry.types";

export interface NoteBubbleLayout {
  hidden: boolean;
  /** The message icon shown instead of the bubble while it's hidden. */
  icon: Rect;
  bubble: Rect | null;
  /** The × that hides the bubble. */
  close: Rect | null;
  /** The note wrapped to the bubble's width. */
  lines: string[];
}
