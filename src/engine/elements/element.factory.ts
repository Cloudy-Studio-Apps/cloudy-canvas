import { createId } from "@core";

import type { Rect } from "../geometry.types";
import type { CanvasElement } from "./element.types";

/** The fields every new element starts with: a fresh id, its type, z-order index and bounds. */
export function createElementBase<K extends string>(
  type: K,
  rect: Rect,
  index: string,
): CanvasElement & { type: K } {
  return { id: createId(), type, index, x: rect.x, y: rect.y, w: rect.w, h: rect.h };
}
