import { createId } from "@core";

import { boundsOfPoints } from "../../geometry";
import type { StrokeElement } from "./stroke.types";

/** Marker stroke from absolute world points; stored relative to its padded bounding box. */
export function createStroke(
  points: number[],
  color: string,
  size: number,
  index: string,
): StrokeElement {
  const bounds = boundsOfPoints(points);
  const pad = size / 2;
  const x = bounds.x - pad;
  const y = bounds.y - pad;
  return {
    id: createId(),
    type: "stroke",
    index,
    x,
    y,
    w: bounds.w + size,
    h: bounds.h + size,
    color,
    size,
    points: points.map((value, i) => (i % 2 === 0 ? value - x : value - y)),
  };
}
