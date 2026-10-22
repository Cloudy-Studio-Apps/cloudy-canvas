import { ELEMENT_DEFAULTS, measureText, type Rect } from "@canvas";

import { FRAME_DEFAULTS } from "./frame.defaults";
import type { FrameElement } from "./frame.types";

/** Whether a frame shows its name above it: only frames at the top of the page do. */
export function showsLabel(el: FrameElement): boolean {
  return el.parentId === null && el.visible;
}

/** Where a frame's name is drawn, in world units (up to the frame's width). */
export function labelRect(el: FrameElement): Rect {
  const { fontSize, gap } = FRAME_DEFAULTS.label;
  const h = fontSize * ELEMENT_DEFAULTS.lineHeight;
  const w = Math.min(el.w, measureText(el.name, fontSize).w);
  return { x: el.x, y: el.y - gap - h, w, h };
}
