import { ER_FONT_SIZE } from "../document";
import type { Size } from "../geometry.types";
import { measureText } from "../text/text-metrics";

const ENTITY_PAD_X = 22;
const ENTITY_MIN_W = 120;
const ENTITY_H = 44;
const ATTRIBUTE_PAD_X = 16;
const ATTRIBUTE_MIN_W = 76;
const ATTRIBUTE_H = 36;
const RELATION_MIN_W = 112;
const RELATION_H = 64;

/** Entity rectangle: wide enough for the name. */
export function entitySize(name: string): Size {
  const text = measureText(name, ER_FONT_SIZE);
  return { w: Math.max(ENTITY_MIN_W, Math.ceil(text.w + ENTITY_PAD_X * 2)), h: ENTITY_H };
}

/** Attribute ellipse: the name fits on its middle line. */
export function attributeSize(name: string): Size {
  const text = measureText(name, ER_FONT_SIZE);
  return { w: Math.max(ATTRIBUTE_MIN_W, Math.ceil(text.w + ATTRIBUTE_PAD_X * 2)), h: ATTRIBUTE_H };
}

/**
 * Relation diamond. A box of text (tw × th) fits inside a diamond when tw/W + th/H ≤ 1, so the
 * width grows with the name.
 */
export function relationSize(name: string): Size {
  const text = measureText(name, ER_FONT_SIZE);
  const free = 1 - text.h / RELATION_H;
  return { w: Math.max(RELATION_MIN_W, Math.ceil(text.w / free + 24)), h: RELATION_H };
}
