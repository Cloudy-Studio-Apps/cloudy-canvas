import type { FontStyle, FontWeight, TextAlign } from "@canvas";

import { nonNegative } from "../core";
import type { TextAutoResize, TextNodeElement, TextVerticalAlign } from "./text.types";

const WEIGHTS: readonly FontWeight[] = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];
const STYLES: readonly FontStyle[] = ["normal", "italic"];
const ALIGNS: readonly TextAlign[] = ["left", "center", "right", "justify"];
const VERTICAL_ALIGNS: readonly TextVerticalAlign[] = ["top", "middle", "bottom"];
const AUTO_RESIZES: readonly TextAutoResize[] = ["width", "height", "none"];

/** The text fields agents may give or patch, in the `create_nodes` schema. */
export const TEXT_SPEC_PROPERTIES = {
  fontFamily: {
    type: "string",
    description: "Text: a font family (list_fonts); Inter by default.",
  },
  fontSize: { type: "number" },
  fontWeight: { enum: WEIGHTS, description: "Text: 400 is regular, 700 bold." },
  fontStyle: { enum: STYLES },
  lineHeight: { type: "number", description: "Text: line height, a multiple of the font size." },
  letterSpacing: { type: "number", description: "Text: extra space between characters." },
  textAlign: { enum: ALIGNS },
  verticalAlign: { enum: VERTICAL_ALIGNS },
  autoResize: {
    enum: AUTO_RESIZES,
    description:
      "Text: width grows with the text (no wrapping; the default), height wraps at w and grows " +
      "down (the default when w is given), none keeps w and h.",
  },
};

/**
 * The text fields among `fields` (a spec's args or a patch), checked. Font weights may be given
 * as numbers (700).
 */
export function textFields(fields: Readonly<Record<string, unknown>>): Partial<TextNodeElement> {
  const out: Partial<TextNodeElement> = {};
  if (fields.text !== undefined) {
    if (typeof fields.text !== "string" || fields.text === "") {
      throw new Error('"text" must be a non-empty string (delete the layer to remove it).');
    }
    out.text = fields.text;
  }
  if (fields.fontFamily !== undefined) {
    if (typeof fields.fontFamily !== "string" || fields.fontFamily.trim() === "") {
      throw new Error('"fontFamily" must be a font family name.');
    }
    out.fontFamily = fields.fontFamily.trim();
  }
  if (fields.fontSize !== undefined) out.fontSize = positive(fields.fontSize, "fontSize");
  if (fields.lineHeight !== undefined) out.lineHeight = positive(fields.lineHeight, "lineHeight");
  if (fields.letterSpacing !== undefined) {
    if (typeof fields.letterSpacing !== "number" || !Number.isFinite(fields.letterSpacing)) {
      throw new Error('"letterSpacing" must be a number.');
    }
    out.letterSpacing = fields.letterSpacing;
  }
  if (fields.fontWeight !== undefined) {
    out.fontWeight = choice(String(fields.fontWeight), "fontWeight", WEIGHTS);
  }
  if (fields.fontStyle !== undefined) {
    out.fontStyle = choice(fields.fontStyle, "fontStyle", STYLES);
  }
  if (fields.textAlign !== undefined) out.textAlign = choice(fields.textAlign, "textAlign", ALIGNS);
  if (fields.verticalAlign !== undefined) {
    out.verticalAlign = choice(fields.verticalAlign, "verticalAlign", VERTICAL_ALIGNS);
  }
  if (fields.autoResize !== undefined) {
    out.autoResize = choice(fields.autoResize, "autoResize", AUTO_RESIZES);
  }
  return out;
}

function positive(value: unknown, key: string): number {
  const n = nonNegative(value, key);
  if (n === 0) throw new Error(`"${key}" must be more than 0.`);
  return n;
}

function choice<T extends string>(value: unknown, key: string, choices: readonly T[]): T {
  if (!choices.includes(value as T)) {
    throw new Error(`"${key}" must be one of: ${choices.join(", ")}.`);
  }
  return value as T;
}
