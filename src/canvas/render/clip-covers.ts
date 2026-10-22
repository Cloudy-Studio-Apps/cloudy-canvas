import { rectContainsPoint } from "../geometry";
import type { Rect } from "../geometry.types";
import { rotatePoint } from "../rotation";
import type { ElementClip } from "./layer-placement.types";

/**
 * Whether `clip` would cut nothing off `drawn` (a world rect), so the view needs no mask. With
 * rounded corners, only the part clear of the corners counts; a turned clip is checked in its own
 * frame.
 */
export function clipCovers(clip: ElementClip, drawn: Rect): boolean {
  const { x, y, w, h } = clip.rect;
  const inset = Math.min(clip.radius, w / 2, h / 2);
  const inner = { x: x + inset, y: y + inset, w: w - inset * 2, h: h - inset * 2 };
  const turn = clip.rotation ?? 0;
  const corners = [
    { x: drawn.x, y: drawn.y },
    { x: drawn.x + drawn.w, y: drawn.y },
    { x: drawn.x + drawn.w, y: drawn.y + drawn.h },
    { x: drawn.x, y: drawn.y + drawn.h },
  ];
  return corners.every((p) => rectContainsPoint(inner, rotatePoint(p, clip.rect, -turn)));
}
