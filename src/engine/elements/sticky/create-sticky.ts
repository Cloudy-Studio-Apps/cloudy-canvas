import { createId } from "@core";

import type { Point } from "../../geometry.types";
import { STICKY_SIZE } from "./sticky-defaults";
import type { StickyElement } from "./sticky.types";

/** Sticky note centered on `center`. */
export function createSticky(center: Point, color: string, index: string): StickyElement {
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
