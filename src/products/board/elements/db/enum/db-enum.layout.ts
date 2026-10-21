import { measureText, type Size } from "@canvas";

import { cardHeight, DB_CARD_DEFAULTS } from "../card";

const { fontSize, paddingX } = DB_CARD_DEFAULTS;
const MIN_WIDTH = 140;
/** Bold header text is a bit wider than the regular-weight measurement. */
const BOLD_FACTOR = 1.08;

/** Width and height of an enum card. */
export function enumSize(name: string, values: readonly { name: string }[]): Size {
  let w = measureText(`enum ${name}`, fontSize + 1).w * BOLD_FACTOR + paddingX * 2;
  for (const value of values) w = Math.max(w, measureText(value.name, fontSize).w + paddingX * 2);
  return { w: Math.max(MIN_WIDTH, Math.ceil(w / 4) * 4), h: cardHeight(values.length) };
}
