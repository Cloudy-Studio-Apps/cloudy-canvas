import type { TokenScope } from "@canvas";

/** Figma's variable scopes as ours (`ALL_SCOPES`: none, offered everywhere). */
const SCOPES: Record<string, TokenScope> = {
  ALL_FILLS: "all-fills",
  FRAME_FILL: "frame-fill",
  SHAPE_FILL: "shape-fill",
  TEXT_FILL: "text-fill",
  STROKE: "stroke-color",
  STROKE_COLOR: "stroke-color",
  EFFECT_COLOR: "effect-color",
  CORNER_RADIUS: "corner-radius",
  WIDTH_HEIGHT: "width-height",
  GAP: "gap",
  STROKE_FLOAT: "stroke-weight",
  OPACITY: "opacity",
  FONT_SIZE: "font-size",
  LINE_HEIGHT: "line-height",
  LETTER_SPACING: "letter-spacing",
  FONT_WEIGHT: "font-weight",
  EFFECT_FLOAT: "effect-value",
  TEXT_CONTENT: "text-content",
  FONT_FAMILY: "font-family",
  FONT_STYLE: "font-style",
};

/** A variable's scopes: Figma's that have a counterpart, none for `ALL_SCOPES`. */
export function figScopes(scopes: readonly string[] | undefined): TokenScope[] {
  if (!scopes || scopes.includes("ALL_SCOPES")) return [];
  return [...new Set(scopes.flatMap((scope) => SCOPES[scope] ?? []))];
}
