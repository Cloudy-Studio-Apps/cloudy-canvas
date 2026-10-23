import type { FontStyle, FontWeight, TextDecoration } from "@canvas";
import type { FigNode } from "@canvas/figma";

import { TEXT_DEFAULTS } from "../../modules";

/** Weights by the words of a face's style name ("Semi Bold Italic"), checked in order. */
const WEIGHT_WORDS: readonly [RegExp, FontWeight][] = [
  [/thin|hairline/, "100"],
  [/extra ?light|ultra ?light/, "200"],
  [/semi ?bold|demi ?bold/, "600"],
  [/extra ?bold|ultra ?bold|heavy/, "800"],
  [/light/, "300"],
  [/medium/, "500"],
  [/black/, "900"],
  [/bold/, "700"],
];

/** Figma's "Auto" line height: 100% of the font's own, which ours approximates. */
const AUTO_LINE_HEIGHT = 100;

/** The face a Figma font name picks: its family, and the weight and style its style name says. */
export function faceOf(fontName: FigNode["fontName"]): {
  fontFamily: string;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
} {
  const style = (fontName?.style ?? "").toLowerCase();
  return {
    fontFamily: fontName?.family || TEXT_DEFAULTS.typography.fontFamily,
    fontWeight: WEIGHT_WORDS.find(([words]) => words.test(style))?.[1] ?? "400",
    fontStyle: /italic|oblique/.test(style) ? "italic" : "normal",
  };
}

/** A line height as a multiple of the font size. */
export function lineHeightOf(lineHeight: FigNode["lineHeight"], fontSize: number): number {
  const { value, units } = lineHeight ?? {};
  if (value === undefined) return TEXT_DEFAULTS.typography.lineHeight;
  if (units === "RAW") return value;
  if (units === "PIXELS") return fontSize > 0 ? value / fontSize : 1;
  return value === AUTO_LINE_HEIGHT ? TEXT_DEFAULTS.typography.lineHeight : value / 100;
}

/** Letter spacing in world units. */
export function letterSpacingOf(letterSpacing: FigNode["letterSpacing"], fontSize: number): number {
  const { value = 0, units } = letterSpacing ?? {};
  return units === "PERCENT" ? (value / 100) * fontSize : value;
}

/** A text decoration (Figma's UNDERLINE, STRIKETHROUGH or NONE). */
export function decorationOf(decoration: string | undefined): TextDecoration {
  if (decoration === "UNDERLINE") return "underline";
  if (decoration === "STRIKETHROUGH") return "strikethrough";
  return "none";
}
