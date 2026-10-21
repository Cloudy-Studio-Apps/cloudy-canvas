import {
  ER_AGGREGATE_TITLE_H,
  ER_FONT_SIZE,
  FONT_FAMILY,
  GEO_PADDING,
  INK_COLOR,
  LINE_HEIGHT,
  SECTION_FONT_SIZE,
  STICKY_FONT_SIZE,
  STICKY_PADDING,
  isErNamed,
  type EditableShape,
} from "../document";
import type { Point } from "../geometry.types";
import { sectionTitleOrigin } from "../sections";

/** Inline styles that make the textarea overlay match how the shape's text is drawn on canvas. */
export function textEditorStyle(shape: EditableShape): Partial<CSSStyleDeclaration> {
  const isSticky = shape.type === "sticky";
  // ER names are centered like geo labels (an aggregation's sits at its top left).
  const isGeo = shape.type === "geo" || (isErNamed(shape) && shape.type !== "er-aggregate");
  const wraps = isSticky || isGeo;
  const fontSize = editorFontSize(shape);
  return {
    position: "absolute",
    left: "0",
    top: "0",
    transformOrigin: "0 0",
    margin: "0",
    border: "0",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    background: "transparent",
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY,
    fontSize: `${fontSize}px`,
    fontWeight: BOLD.has(shape.type) ? "600" : "400",
    lineHeight: `${fontSize * LINE_HEIGHT}px`,
    color: shape.type === "text" ? shape.color : INK_COLOR,
    caretColor: INK_COLOR,
    whiteSpace: wraps ? "pre-wrap" : "pre",
    overflowWrap: wraps ? "break-word" : "normal",
    textAlign: isGeo ? "center" : "left",
    padding: isSticky ? `${STICKY_PADDING}px` : isGeo ? `0 ${GEO_PADDING}px` : "0",
    width: `${shape.w}px`,
    height: `${shape.type === "er-aggregate" ? ER_AGGREGATE_TITLE_H : shape.h}px`,
    zIndex: "1",
  };
}

export function editorFontSize(shape: EditableShape): number {
  if (shape.type === "sticky") return STICKY_FONT_SIZE;
  if (shape.type === "section") return SECTION_FONT_SIZE;
  if (shape.type === "er-aggregate") return ER_FONT_SIZE - 1;
  if (isErNamed(shape)) return ER_FONT_SIZE;
  return shape.fontSize;
}

/** Shapes whose text is drawn bold. */
const BOLD = new Set<string>(["section", "er-entity", "er-aggregate"]);

/** World position of the textarea's top-left corner (a section's title sits above it). */
export function editorOrigin(shape: EditableShape): Point {
  if (shape.type === "section") return sectionTitleOrigin(shape);
  if (shape.type === "er-aggregate") return { x: shape.x + AGGREGATE_TITLE_X, y: shape.y };
  return { x: shape.x, y: shape.y };
}

/** Where an aggregation's name starts (see `draw-er-aggregate.ts`). */
const AGGREGATE_TITLE_X = 8;
