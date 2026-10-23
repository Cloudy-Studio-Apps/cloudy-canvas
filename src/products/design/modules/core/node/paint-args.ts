import type { Size } from "@canvas";

import {
  cssGradientPaint,
  GRADIENT_PAINT_TYPES,
  isCssGradient,
  readGradientPaint,
} from "./gradient-args";
import { readImagePaint } from "./image-paint-args";
import { fraction } from "./number-args";
import { hexColor } from "./paint-args-color";
import type { GradientPaint, Paint, SolidPaint } from "./paint.types";

export { hexColor };

const NO_PAINT = new Set(["transparent", "none"]);

/**
 * The paints of a shorthand color: one solid paint, one gradient for a CSS gradient (laid on a
 * box of `size`), or none for "transparent" / "none".
 */
export function colorPaints(value: string, key: string, size?: Size): Paint[] {
  if (NO_PAINT.has(value)) return [];
  if (isCssGradient(value)) return [cssGradientPaint(value, key, size)];
  return [{ type: "solid", color: hexColor(value, key), opacity: 1, visible: true }];
}

/**
 * Paints given in full, bottom to top: `{ type: "solid", color, opacity?, visible? }`, a gradient
 * `{ type: "linear" | "radial" | "angular" | "diamond", stops, transform? | from?/to?/width? |
 * angle?, interpolation?, opacity?, visible? }` or a CSS gradient string (both laid on a box of
 * `size`), or an image (only when `images`, see `readImagePaint`).
 */
export function readPaints(value: unknown, key: string, images: boolean, size?: Size): Paint[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array of paints.`);
  return value.map((item, i) => readPaint(item, `${key}[${i}]`, images, size));
}

function readPaint(item: unknown, key: string, images: boolean, size?: Size): Paint {
  if (isCssGradient(item)) return cssGradientPaint(item, key, size);
  if (typeof item !== "object" || item === null) throw new Error(`"${key}" must be a paint.`);
  const paint = item as Record<string, unknown>;
  const opacity = paint.opacity === undefined ? 1 : fraction(paint.opacity, `${key}.opacity`);
  if (paint.visible !== undefined && typeof paint.visible !== "boolean") {
    throw new Error(`"${key}.visible" must be true or false.`);
  }
  const visible = paint.visible ?? true;
  if (paint.type === "solid") {
    const color = hexColor(paint.color, `${key}.color`);
    return { type: "solid", color, opacity, visible } satisfies SolidPaint;
  }
  if (GRADIENT_PAINT_TYPES.includes(paint.type as GradientPaint["type"])) {
    return readGradientPaint(paint, key, { opacity, visible }, size);
  }
  if (paint.type === "image") {
    if (!images) throw new Error(`"${key}" can't be an image here.`);
    return readImagePaint(paint, key, { opacity, visible });
  }
  const types = ["solid", ...GRADIENT_PAINT_TYPES, ...(images ? ["image"] : [])];
  throw new Error(`"${key}.type" must be one of: ${types.join(", ")}.`);
}
