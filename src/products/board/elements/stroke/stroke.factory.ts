import { boundsOfPoints, createElementBase } from "@canvas";

import type { StrokeElement, StrokePen } from "./stroke.types";

/** Stroke from absolute world points; stored relative to its padded bounding box. */
export function createStroke(
  points: number[],
  pen: StrokePen,
  color: string,
  size: number,
  index: string,
): StrokeElement {
  const bounds = boundsOfPoints(points);
  const pad = size / 2;
  const x = bounds.x - pad;
  const y = bounds.y - pad;
  const rect = { x, y, w: bounds.w + size, h: bounds.h + size };
  return {
    ...createElementBase("stroke", rect, index),
    pen,
    color,
    size,
    points: points.map((value, i) => (i % 2 === 0 ? value - x : value - y)),
  };
}
