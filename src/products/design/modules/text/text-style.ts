import type { StyleRecord } from "@canvas";
import { FONT_WEIGHTS } from "@shared/core";

import type { TextNodeElement, TextStyleValue } from "./text.types";
import { t } from "./text.i18n";

/** The `styleType` of text styles. */
export const TEXT_STYLE = "text";

/** The path a text's style binding is stored at. */
export const TEXT_STYLE_PATH = "textStyle";

const DECORATIONS = new Set(["none", "underline", "strikethrough"]);

/** What a text style saves of a text: its typography and decoration. */
export function textStyleOfNode(el: TextNodeElement): TextStyleValue {
  return {
    fontFamily: el.fontFamily,
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    lineHeight: el.lineHeight,
    letterSpacing: el.letterSpacing,
    textDecoration: el.textDecoration,
  };
}

/** A stored style value's fields a text takes (anything else, or invalid, left out). */
export function readTextStyle(value: Readonly<Record<string, unknown>>): Partial<TextStyleValue> {
  const out: Partial<TextStyleValue> = {};
  if (typeof value.fontFamily === "string" && value.fontFamily) out.fontFamily = value.fontFamily;
  if (typeof value.fontSize === "number" && value.fontSize > 0) out.fontSize = value.fontSize;
  if (typeof value.fontWeight === "string" && FONT_WEIGHTS.includes(value.fontWeight as never)) {
    out.fontWeight = value.fontWeight as TextStyleValue["fontWeight"];
  }
  if (value.fontStyle === "normal" || value.fontStyle === "italic") out.fontStyle = value.fontStyle;
  if (typeof value.lineHeight === "number" && value.lineHeight > 0) {
    out.lineHeight = value.lineHeight;
  }
  if (typeof value.letterSpacing === "number") out.letterSpacing = value.letterSpacing;
  if (typeof value.textDecoration === "string" && DECORATIONS.has(value.textDecoration)) {
    out.textDecoration = value.textDecoration as TextStyleValue["textDecoration"];
  }
  return out;
}

/** A text style's short description, as Figma's list shows it: "16/120%". */
export function textStyleSummary(style: StyleRecord): string {
  const value = readTextStyle(style.value);
  const size = value.fontSize === undefined ? "?" : String(Math.round(value.fontSize * 10) / 10);
  const line =
    value.lineHeight === undefined ? t("styles.auto") : `${Math.round(value.lineHeight * 100)}%`;
  return `${size}/${line}`;
}
