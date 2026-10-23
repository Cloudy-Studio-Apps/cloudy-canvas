import { measureText, type Size } from "@canvas";

import type { ErAttributeLook } from "../attribute/attribute.types";
import { ER_DEFAULTS } from "./er.defaults";

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
  const text = measureText(name, ER_DEFAULTS.fontSize);
  return { w: Math.max(ENTITY_MIN_W, Math.ceil(text.w + ENTITY_PAD_X * 2)), h: ENTITY_H };
}

/** Diameter of a lollipop attribute's circle. */
export const LOLLIPOP_SIZE = 12;
/** Space between a lollipop's label and its circle. */
export const LOLLIPOP_GAP = 3;
/** The hierarchy triangle. */
export const ISA_SIZE: Size = { w: 64, h: 40 };
export const UNION_SIZE: Size = { w: 32, h: 32 };

/**
 * Attribute: an ellipse with the name on its middle line, or (lollipop look) a small circle with
 * the name above it.
 */
export function attributeSize(name: string, look: ErAttributeLook = "ellipse"): Size {
  const text = measureText(name, ER_DEFAULTS.fontSize);
  if (look === "lollipop") {
    return {
      w: Math.max(LOLLIPOP_SIZE, Math.ceil(text.w)),
      h: Math.ceil(text.h) + LOLLIPOP_GAP + LOLLIPOP_SIZE,
    };
  }
  return { w: Math.max(ATTRIBUTE_MIN_W, Math.ceil(text.w + ATTRIBUTE_PAD_X * 2)), h: ATTRIBUTE_H };
}

/**
 * Relation diamond. A box of text (tw × th) fits inside a diamond when tw/W + th/H ≤ 1, so the
 * width grows with the name.
 */
export function relationSize(name: string): Size {
  const text = measureText(name, ER_DEFAULTS.fontSize);
  const free = 1 - text.h / RELATION_H;
  return { w: Math.max(RELATION_MIN_W, Math.ceil(text.w / free + 24)), h: RELATION_H };
}
