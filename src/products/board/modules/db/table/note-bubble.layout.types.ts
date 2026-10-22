import type { Rect } from "@canvas";

export interface NoteBubble {
  /** The table's own note, or one column's note. */
  kind: "table" | "column";
  rect: Rect;
  /** The note wrapped to the bubble's width. */
  lines: string[];
  /** World y the bubble's tail points at (the header, or the column's row). */
  anchorY: number;
}

export interface NoteBubbleLayout {
  hidden: boolean;
  /** The message icon shown instead of the bubbles while they're hidden. */
  icon: Rect;
  /** Top to bottom; empty while hidden. */
  bubbles: NoteBubble[];
  /** The × (on the first bubble) that hides them all. */
  close: Rect | null;
}
