import type { Point, Rect } from "../geometry.types";
import type { Alignment } from "./arrange.types";

/** How far `rect` moves to line up with `target` (the selection's bounds, or a parent's). */
export function alignOffset(rect: Rect, target: Rect, alignment: Alignment): Point {
  switch (alignment) {
    case "left":
      return { x: target.x - rect.x, y: 0 };
    case "centerX":
      return { x: Math.round(target.x + target.w / 2 - (rect.x + rect.w / 2)), y: 0 };
    case "right":
      return { x: target.x + target.w - (rect.x + rect.w), y: 0 };
    case "top":
      return { x: 0, y: target.y - rect.y };
    case "centerY":
      return { x: 0, y: Math.round(target.y + target.h / 2 - (rect.y + rect.h / 2)) };
    case "bottom":
      return { x: 0, y: target.y + target.h - (rect.y + rect.h) };
  }
}
