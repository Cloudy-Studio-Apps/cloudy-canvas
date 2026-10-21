import { boundsOfPoints } from "../../geometry";
import { createElementBase } from "../element.factory";
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
  const rect = { x, y, w: bounds.w + size, h: bounds.h + size };
  return {
    ...createElementBase("stroke", rect, index),
    color,
    size,
    points: points.map((value, i) => (i % 2 === 0 ? value - x : value - y)),
  };
}
