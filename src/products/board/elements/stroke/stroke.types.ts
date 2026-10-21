import type { CanvasElement } from "@canvas";

/** A freehand marker stroke. */
export interface StrokeElement extends CanvasElement {
  type: "stroke";
  color: string;
  /** Marker thickness in world units. */
  size: number;
  /** Flat [x0, y0, x1, y1, …] list, relative to (x, y). */
  points: number[];
}
