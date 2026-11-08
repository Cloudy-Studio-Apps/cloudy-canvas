import type { PathShape, Point, SvgPaint } from "@canvas";

/** How an SVG's user space lands in the world: its shapes, its points, and its scale. */
export interface SvgPlacement {
  toWorld: (shape: PathShape) => PathShape;
  place: (p: Point) => Point;
  /** World units per user unit (stroke widths scale by it). */
  scale: number;
}

/** One painted area of an SVG: a shape's fill, or the area its stroke covers. */
export interface SvgArea {
  shape: PathShape;
  paint: SvgPaint;
  opacity: number;
}
