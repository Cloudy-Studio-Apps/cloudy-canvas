import type { FillInput, Graphics, StrokeInput } from "pixi.js";

import type { PathContour, PathShape } from "./path.types";
import { isLine } from "./path-segments";

/** Adds a contour to the current path. */
export function traceContour(g: Graphics, contour: PathContour): void {
  g.moveTo(contour.start.x, contour.start.y);
  let from = contour.start;
  for (const segment of contour.segments) {
    const { c1, c2, to } = segment;
    if (isLine(from, segment)) g.lineTo(to.x, to.y);
    else g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, to.x, to.y);
    from = to;
  }
  if (contour.closed) g.closePath();
}

/**
 * Fills a normalized shape with real holes: each outer is filled, then its holes are cut out of
 * it. An empty shape draws nothing.
 */
export function fillPath(g: Graphics, shape: PathShape, style: FillInput): void {
  for (const contour of shape.contours) {
    traceContour(g, contour);
    if (contour.hole) g.cut();
    else g.fill(style);
  }
}

/** Strokes every contour of a shape. */
export function strokePath(g: Graphics, shape: PathShape, style: StrokeInput): void {
  if (shape.contours.length === 0) return;
  for (const contour of shape.contours) traceContour(g, contour);
  g.stroke(style);
}
