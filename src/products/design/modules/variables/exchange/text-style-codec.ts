import {
  dtcgDimension,
  readDimension,
  readFontWeight,
  referenceOf,
  type DtcgStyleCodec,
} from "@canvas";

import { readTextStyle, TEXT_STYLE } from "../../text";
import type { TextStyleValue } from "../../text";

/** Text styles as DTCG `typography`: family, size, weight, line height, letter spacing. */
export const TEXT_STYLE_CODEC: DtcgStyleCodec = {
  styleType: TEXT_STYLE,
  dtcgType: "typography",
  group: "Text",
  write(style, ref) {
    const value = readTextStyle(style.value);
    const bound = (path: string) => {
      const id = style.bindings?.[path];
      return id ? ref(id) : null;
    };
    return {
      fontFamily: bound("fontFamily") ?? value.fontFamily ?? "Inter",
      fontSize: bound("fontSize") ?? dtcgDimension(value.fontSize ?? 16),
      fontWeight: bound("fontWeight") ?? Number(value.fontWeight ?? 400),
      lineHeight: bound("lineHeight") ?? value.lineHeight ?? 1.2,
      letterSpacing: bound("letterSpacing") ?? dtcgDimension(value.letterSpacing ?? 0),
    };
  },
  read(raw, refs) {
    if (typeof raw !== "object" || raw === null) return null;
    const fields = raw as Record<string, unknown>;
    const bindings: Record<string, string> = {};
    // A reference binds the part (and gives its value); the weight, stored as a name, only
    // takes the value.
    const field = (path: string, bind = true): unknown => {
      const reference = referenceOf(fields[path]);
      if (reference === null) return fields[path];
      const id = refs.id(reference);
      if (id && bind) bindings[path] = id;
      return refs.value(reference);
    };
    const rawFamily = field("fontFamily");
    const family = Array.isArray(rawFamily) ? rawFamily[0] : rawFamily;
    const fontSize = readDimension(field("fontSize")) ?? 16;
    const value: TextStyleValue = {
      fontFamily: typeof family === "string" ? family : "Inter",
      fontSize,
      fontWeight: weightOf(field("fontWeight", false)),
      fontStyle: "normal",
      lineHeight: lineHeightOf(field("lineHeight"), fontSize),
      letterSpacing: readDimension(field("letterSpacing")) ?? 0,
      textDecoration: "none",
    };
    return { value: { ...value }, bindings };
  },
};

/** A unitless line height is a multiplier; a length is divided by the font size. */
function lineHeightOf(raw: unknown, fontSize: number): number {
  if (typeof raw === "number") return raw > 0 ? raw : 1.2;
  if (typeof raw === "string" && raw.trim().endsWith("%"))
    return (Number.parseFloat(raw) || 120) / 100;
  const px = readDimension(raw);
  return px && px > 0 ? px / fontSize : 1.2;
}

function weightOf(raw: unknown): TextStyleValue["fontWeight"] {
  return (readFontWeight(raw) ?? "400") as TextStyleValue["fontWeight"];
}
