import { cropInside, type CanvasElement, type ElementPatch, type ImageCrop } from "@canvas";

import type { ImageElement } from "./image.types";

/** What a board image asks the host for: cropping it on the canvas. */
export const IMAGE_ACTIONS = { crop: "image.crop" } as const;

/** The whole picture. */
const FULL: ImageCrop = { x: 0, y: 0, w: 1, h: 1 };

/** Double-click (or Enter) on an image crops it, in the host's crop overlay. */
export function editImage(el: CanvasElement, ctx: { activate(id: string, action: string): void }) {
  if (el.type !== "image") return false;
  ctx.activate(el.id, IMAGE_ACTIONS.crop);
  return true;
}

/**
 * A new crop (`null`: the whole picture): the bounds grow or shrink round the part shown, so the
 * picture keeps its scale and stays where it is.
 */
export function imageCropPatch(
  el: ImageElement,
  crop: ImageCrop | null,
): ElementPatch<ImageElement> {
  const before = el.crop ?? FULL;
  const after = crop ?? FULL;
  const p = el.padding;
  const w = el.w - p * 2;
  const h = el.h - p * 2;
  return {
    crop,
    x: el.x + ((after.x - before.x) / before.w) * w,
    y: el.y + ((after.y - before.y) / before.h) * h,
    w: (w * after.w) / before.w + p * 2,
    h: (h * after.h) / before.h + p * 2,
  };
}

/** An agent's crop, checked: fractions of the picture, inside it. */
export function checkCrop(value: unknown): ImageCrop | null {
  if (value === null) return null;
  const crop = value as Partial<Record<keyof ImageCrop, unknown>>;
  const valid =
    typeof crop === "object" &&
    (["x", "y", "w", "h"] as const).every((k) => Number.isFinite(crop[k])) &&
    (crop.w as number) > 0 &&
    (crop.h as number) > 0 &&
    cropInside(crop as ImageCrop);
  if (!valid) {
    throw new Error('"crop" must be null or { x, y, w, h }, fractions inside the picture.');
  }
  const { x, y, w, h } = crop as ImageCrop;
  return { x, y, w, h };
}
