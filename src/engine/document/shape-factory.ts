import { createId } from "@core";

import type { Point } from "../geometry.types";
import { boundsOfPoints } from "../geometry";
import { INK_COLOR } from "./palette";
import { LINE_HEIGHT, STICKY_SIZE, TEXT_FONT_SIZE } from "./shape-defaults";
import type { StickyShape, StrokeShape, TextShape } from "./shapes.types";

/** Sticky note centered on `center`. */
export function createStickyShape(center: Point, color: string, index: string): StickyShape {
  return {
    id: createId(),
    type: "sticky",
    index,
    x: Math.round(center.x - STICKY_SIZE / 2),
    y: Math.round(center.y - STICKY_SIZE / 2),
    w: STICKY_SIZE,
    h: STICKY_SIZE,
    color,
    text: "",
  };
}

/**
 * Empty text shape whose first line is vertically centered on `at`. Its index is assigned
 * when the draft is committed to the document.
 */
export function createTextDraft(at: Point, fontSize = TEXT_FONT_SIZE): TextShape {
  const lineHeight = fontSize * LINE_HEIGHT;
  return {
    id: createId(),
    type: "text",
    index: "",
    x: Math.round(at.x),
    y: Math.round(at.y - lineHeight / 2),
    w: 2,
    h: Math.ceil(lineHeight),
    color: INK_COLOR,
    fontSize,
    text: "",
  };
}

/** Marker stroke from absolute world points; stored relative to its padded bounding box. */
export function createStrokeShape(
  points: number[],
  color: string,
  size: number,
  index: string,
): StrokeShape {
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
