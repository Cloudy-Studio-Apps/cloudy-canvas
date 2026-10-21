import type { Shape } from "./shapes.types";

/** Areas are padded to this many digits so they sort as strings. */
const AREA_DIGITS = 15;
const MAX_AREA = 10 ** AREA_DIGITS - 1;

/**
 * Drawing order as a string key (lexicographic, bottom to top). Sections come first, larger ones
 * further back so nested sections show above the sections around them; then every other shape
 * by its fractional index.
 */
export function zOrderKey(shape: Shape): string {
  if (shape.type !== "section") return `1${shape.index}`;
  const area = Math.min(MAX_AREA, Math.max(0, Math.round(shape.w * shape.h)));
  return `0${String(MAX_AREA - area).padStart(AREA_DIGITS, "0")}${shape.index}`;
}

export function compareZOrder(a: Shape, b: Shape): number {
  const ka = zOrderKey(a);
  const kb = zOrderKey(b);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}
