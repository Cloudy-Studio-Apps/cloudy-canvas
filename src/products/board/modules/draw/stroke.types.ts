import type { CanvasElement, ElementDefaults } from "@canvas";

/** What drew a stroke: an opaque pen, or a wide translucent highlighter. */
export type StrokePen = "pen" | "highlighter";

/** A freehand stroke. */
export interface StrokeElement extends CanvasElement {
  type: "stroke";
  pen: StrokePen;
  color: string;
  /** Thickness in world units. */
  size: number;
  /** Flat [x0, y0, x1, y1, …] list, relative to (x, y). */
  points: number[];
}

/** How each pen's outline is traced by perfect-freehand. */
export interface StrokePenLook {
  thinning: number;
  smoothing: number;
  streamline: number;
  /** Rounded ends (flat when false). */
  caps: boolean;
  /** Fill opacity. */
  alpha: number;
}

export interface StrokeDefaults extends ElementDefaults {
  pen: StrokePen;
  pens: Record<StrokePen, StrokePenLook>;
  /** Screen pixels a smoothed stroke may drift from what was drawn before its points are dropped. */
  smoothTolerance: number;
  /** Corner-cutting passes after simplifying a smoothed stroke. */
  smoothPasses: number;
  /** The largest thickness agents may set, in world units. */
  maxSize: number;
}
