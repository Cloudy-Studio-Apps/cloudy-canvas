import type { TextStyle } from "pixi.js";

import type { FontStyle, FontWeight } from "../../text/text-font.types";

/** What names a face of a text: its family list, weight and style. */
export function faceKey(family: string, weight: FontWeight, style: FontStyle): string {
  return `${family}|${weight}|${style}`;
}

/** A Pixi text's font weight as a stored weight. */
export function weightOf(style: TextStyle): FontWeight {
  const { fontWeight } = style;
  if (fontWeight === "normal") return "400";
  return fontWeight === "bold" ? "700" : (fontWeight as FontWeight);
}

/** A Pixi text's family list. */
export function familyOf(style: TextStyle): string {
  const { fontFamily } = style;
  return Array.isArray(fontFamily) ? fontFamily.join(", ") : fontFamily;
}
