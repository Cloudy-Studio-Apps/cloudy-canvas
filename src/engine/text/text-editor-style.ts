import {
  FONT_FAMILY,
  INK_COLOR,
  LINE_HEIGHT,
  STICKY_FONT_SIZE,
  STICKY_PADDING,
  type EditableShape,
} from "../document";

/** Inline styles that make the textarea overlay match how the shape's text is drawn on canvas. */
export function textEditorStyle(shape: EditableShape): Partial<CSSStyleDeclaration> {
  const isSticky = shape.type === "sticky";
  const fontSize = isSticky ? STICKY_FONT_SIZE : shape.fontSize;
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
    lineHeight: `${fontSize * LINE_HEIGHT}px`,
    color: isSticky ? INK_COLOR : shape.color,
    caretColor: INK_COLOR,
    whiteSpace: isSticky ? "pre-wrap" : "pre",
    overflowWrap: isSticky ? "break-word" : "normal",
    padding: isSticky ? `${STICKY_PADDING}px` : "0",
    width: `${shape.w}px`,
    height: `${shape.h}px`,
    zIndex: "1",
  };
}
