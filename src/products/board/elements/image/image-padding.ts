import type { ElementPatch } from "@canvas";

import type { ImageElement } from "./image.types";

/** A new padding: the image stays where it is, and the bounds grow or shrink around it. */
export function imagePaddingPatch(el: ImageElement, padding: number): ElementPatch<ImageElement> {
  const d = padding - el.padding;
  return { padding, x: el.x - d, y: el.y - d, w: el.w + d * 2, h: el.h + d * 2 };
}
