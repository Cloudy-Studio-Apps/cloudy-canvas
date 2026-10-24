import { FONT_WEIGHT_NAMES, FONT_WEIGHTS, type FontWeight } from "@shared/core";

import type { FaceFromName } from "./text-face-name.types";

/** Weight names longest first, so "Extra Bold" wins over "Bold". */
const NAMED = FONT_WEIGHTS.map((weight) => ({
  weight,
  name: FONT_WEIGHT_NAMES[weight].toLowerCase().replace(/\s+/g, ""),
})).sort((a, b) => b.name.length - a.name.length);

/** Other spellings fonts use for the same weights. */
const ALIASES: Readonly<Record<string, FontWeight>> = {
  hairline: "100",
  ultralight: "200",
  demibold: "600",
  ultrabold: "800",
  heavy: "900",
  normal: "400",
  book: "400",
};

/**
 * A face's name ("Bold Italic", "SemiBold", "700 italic", "Light") as a weight and a style, so a
 * string variable can drive a text's font style. Words it doesn't know are ignored: without a
 * weight in it, only the style is set.
 */
export function faceFromName(name: string): FaceFromName {
  const text = name.toLowerCase();
  const fontStyle = /italic|oblique/.test(text) ? "italic" : "normal";
  const squashed = text.replace(/italic|oblique/g, "").replace(/[\s_-]+/g, "");
  const number = /\b([1-9]00)\b/.exec(text)?.[1];
  if (number && (FONT_WEIGHTS as readonly string[]).includes(number)) {
    return { fontWeight: number as FontWeight, fontStyle };
  }
  const named = NAMED.find((entry) => squashed.includes(entry.name));
  if (named) return { fontWeight: named.weight, fontStyle };
  const alias = Object.entries(ALIASES).find(([word]) => squashed.includes(word));
  return alias ? { fontWeight: alias[1], fontStyle } : { fontStyle };
}
