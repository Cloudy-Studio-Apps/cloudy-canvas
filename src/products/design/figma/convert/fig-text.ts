import type { TextAlign } from "@canvas";
import type { FigImportContext, FigNode } from "@canvas/figma";

import { TEXT_DEFAULTS, type DesignNode, type TextNodeElement } from "../../modules";
import { figTextRuns } from "./fig-text-runs";
import { decorationOf, faceOf, letterSpacingOf, lineHeightOf } from "./fig-typography";

const ALIGN: Record<string, TextAlign> = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
  JUSTIFIED: "justify",
};

/** The text fields of a text layer (its node base is built by the caller), mixed styles too. */
export function textFields(
  node: FigNode,
  ctx: FigImportContext,
): Omit<TextNodeElement, keyof DesignNode> {
  const fontSize = node.fontSize ?? TEXT_DEFAULTS.typography.fontSize;
  const text = withCase(node.textData?.characters ?? "", node.textCase);
  return {
    text,
    ...faceOf(node.fontName),
    fontSize,
    lineHeight: lineHeightOf(node.lineHeight, fontSize),
    letterSpacing: letterSpacingOf(node.letterSpacing, fontSize),
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
    textDecoration: decorationOf(node.textDecoration),
    runs: figTextRuns(node, text.length, ctx),
  };
}

function withCase(text: string, textCase: string | undefined): string {
  if (textCase === "UPPER") return text.toUpperCase();
  if (textCase === "LOWER") return text.toLowerCase();
  if (textCase === "TITLE") return text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return text;
}
