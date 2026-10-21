import type { ElementKind } from "./element.kind";
import type { CanvasElement } from "./element.types";

/** Areas are padded to this many digits so they sort as strings. */
const AREA_DIGITS = 15;
const MAX_AREA = 10 ** AREA_DIGITS - 1;

/**
 * Drawing order as a string key (lexicographic, bottom to top): frames first, larger ones further
 * back so nested frames show above the ones around them; then every other element by its
 * fractional index.
 */
export function zOrderKey(el: CanvasElement, kind: ElementKind): string {
  if (!kind.frame) return `1${el.index}`;
  const area = Math.min(MAX_AREA, Math.max(0, Math.round(el.w * el.h)));
  return `0${String(MAX_AREA - area).padStart(AREA_DIGITS, "0")}${el.index}`;
}
