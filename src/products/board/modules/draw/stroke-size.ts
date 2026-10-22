import type { ElementPatch } from "@canvas";

import type { StrokeElement } from "./stroke.types";

/** A new thickness: the line stays where it is, and the padded bounds grow or shrink around it. */
export function strokeSizePatch(el: StrokeElement, size: number): ElementPatch<StrokeElement> {
  const d = (size - el.size) / 2;
  return {
    size,
    x: el.x - d,
    y: el.y - d,
    w: el.w + d * 2,
    h: el.h + d * 2,
    points: el.points.map((value) => value + d),
  };
}
