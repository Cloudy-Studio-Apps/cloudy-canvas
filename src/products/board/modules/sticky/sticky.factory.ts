import { createElementBase, type Point, roundRect } from "@canvas";

import { STICKY_DEFAULTS } from "./sticky.defaults";
import type { StickyElement } from "./sticky.types";

/** Sticky note centered on `center`. */
export function createSticky(center: Point, color: string, index: string): StickyElement {
  const { w, h } = STICKY_DEFAULTS.size;
  const rect = roundRect({ x: center.x - w / 2, y: center.y - h / 2, w, h });
  return { ...createElementBase("sticky", rect, index), color, text: "" };
}
