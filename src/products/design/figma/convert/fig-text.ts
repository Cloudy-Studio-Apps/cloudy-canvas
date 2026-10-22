import type { FontStyle, FontWeight, TextAlign } from "@canvas";
import type { FigImportContext, FigNode } from "@canvas/figma";

import { TEXT_DEFAULTS, type DesignNode, type TextNodeElement } from "../../modules";

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

const ALIGN: Record<string, TextAlign> = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
  JUSTIFIED: "justify",
};

/** Figma's "Auto" line height: 100% of the font's own, which ours approximates. */
const AUTO_LINE_HEIGHT = 100;

/** The text fields of a text layer (its node base is built by the caller). */
export function textFields(
  node: FigNode,
  ctx: FigImportContext,
): Omit<TextNodeElement, keyof DesignNode> {
  const typography = TEXT_DEFAULTS.typography;
  const fontSize = node.fontSize ?? typography.fontSize;
  const style = (node.fontName?.style ?? "").toLowerCase();
  if (node.textData?.styleOverrideTable?.length) {
    ctx.warnings.add("texts with mixed styles took their first style");
  }
  return {
    text: withCase(node.textData?.characters ?? "", node.textCase),
    fontFamily: node.fontName?.family || typography.fontFamily,
    fontSize,
    fontWeight: WEIGHT_WORDS.find(([words]) => words.test(style))?.[1] ?? "400",
    fontStyle: (/italic|oblique/.test(style) ? "italic" : "normal") as FontStyle,
    lineHeight: lineHeightOf(node, fontSize),
    letterSpacing: letterSpacingOf(node, fontSize),
    textAlign: ALIGN[node.textAlignHorizontal ?? "LEFT"] ?? "left",
    verticalAlign:
      node.textAlignVertical === "CENTER"
        ? "middle"
        : node.textAlignVertical === "BOTTOM"
          ? "bottom"
          : "top",
    autoResize:
      node.textAutoResize === "WIDTH_AND_HEIGHT"
        ? "width"
        : node.textAutoResize === "HEIGHT"
          ? "height"
          : "none",
  };
}

function lineHeightOf(node: FigNode, fontSize: number): number {
  const { value, units } = node.lineHeight ?? {};
  if (value === undefined) return TEXT_DEFAULTS.typography.lineHeight;
  if (units === "RAW") return value;
  if (units === "PIXELS") return fontSize > 0 ? value / fontSize : 1;
  return value === AUTO_LINE_HEIGHT ? TEXT_DEFAULTS.typography.lineHeight : value / 100;
}

function letterSpacingOf(node: FigNode, fontSize: number): number {
  const { value = 0, units } = node.letterSpacing ?? {};
  return units === "PERCENT" ? (value / 100) * fontSize : value;
}

function withCase(text: string, textCase: string | undefined): string {
  if (textCase === "UPPER") return text.toUpperCase();
  if (textCase === "LOWER") return text.toLowerCase();
  if (textCase === "TITLE") return text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return text;
}
