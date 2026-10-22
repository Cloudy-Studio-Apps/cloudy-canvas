import { rectContainsRect } from "../geometry";
import type { Rect } from "../geometry.types";
import type { ElementClip } from "./layer-placement.types";

/**
 * Whether `clip` would cut nothing off `drawn` (a world rect), so the view needs no mask. With
 * rounded corners, only the part clear of the corners counts.
 */
export function clipCovers(clip: ElementClip, drawn: Rect): boolean {
  const { x, y, w, h } = clip.rect;
  const inset = Math.min(clip.radius, w / 2, h / 2);
  const inner = { x: x + inset, y: y + inset, w: w - inset * 2, h: h - inset * 2 };
  return rectContainsRect(inset > 0 ? inner : clip.rect, drawn);
}
