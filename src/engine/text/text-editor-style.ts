import { INK_COLOR } from "../document/palette";
import { FONT_FAMILY, LINE_HEIGHT, type ElementTextStyle } from "../elements";
import type { Size } from "../geometry.types";

/** Inline styles that make the textarea overlay match how the element's text is drawn on canvas. */
export function textEditorStyle(
  style: ElementTextStyle,
  { w, h }: Size,
): Partial<CSSStyleDeclaration> {
  const { fontSize } = style;
  const padTop = style.vAlign === "top" ? style.padY : 0;
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
    fontWeight: style.fontWeight ?? "400",
    lineHeight: `${fontSize * LINE_HEIGHT}px`,
    color: style.color,
    caretColor: INK_COLOR,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    textAlign: style.align,
    padding: `${padTop}px ${style.padX}px`,
    width: `${w}px`,
    height: `${h}px`,
    zIndex: "1",
  };
}
