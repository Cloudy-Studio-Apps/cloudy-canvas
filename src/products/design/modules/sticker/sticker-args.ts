import { STICKER_NODE_DEFAULTS } from "./sticker.defaults";
import type { StickerOutline } from "./sticker.types";

const HEX = /^#[0-9a-f]{6}$/i;

/** An agent's `edgeColor`: a `#RRGGBB` color, or `null` for the sticker's own (white). */
export function readEdgeColor(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || !HEX.test(value)) {
    throw new Error(`"edgeColor" must be a #RRGGBB color or null.`);
  }
  return value.toUpperCase();
}

/**
 * An agent's `outline`: `null` removes it, an object sets its `color`, `width` and `visible`
 * over the current one (or the default).
 */
export function readStickerOutline(
  value: unknown,
  current: StickerOutline | null,
): StickerOutline | null {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`"outline" must be { color, width, visible } or null.`);
  }
  const given = value as Partial<Record<keyof StickerOutline, unknown>>;
  const outline: StickerOutline = { ...(current ?? STICKER_NODE_DEFAULTS.outline) };
  if (given.color !== undefined) {
    if (typeof given.color !== "string" || !HEX.test(given.color)) {
      throw new Error(`"outline.color" must be a #RRGGBB color.`);
    }
    outline.color = given.color.toUpperCase();
  }
  if (given.width !== undefined) {
    if (typeof given.width !== "number" || !(given.width >= 0) || given.width > 64) {
      throw new Error(`"outline.width" must be a number from 0 to 64.`);
    }
    outline.width = given.width;
  }
  if (given.visible !== undefined) outline.visible = given.visible === true;
  return outline;
}
