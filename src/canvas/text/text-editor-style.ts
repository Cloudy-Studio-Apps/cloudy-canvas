import type { ElementTextStyle } from "../elements";
import type { Size } from "../geometry.types";
import { textFont } from "./text-font";

/** Inline styles that make the textarea overlay match how the element's text is drawn on canvas. */
export function textEditorStyle(
  style: ElementTextStyle,
  { w, h }: Size,
  wraps: boolean,
): Partial<CSSStyleDeclaration> {
  const font = textFont(style.fontSize, style);
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
    fontFamily: font.family,
    fontSize: `${font.size}px`,
    fontWeight: font.weight,
    fontStyle: font.style,
    letterSpacing: `${font.letterSpacing}px`,
    lineHeight: `${font.size * font.lineHeight}px`,
    color: style.color,
    caretColor: style.color,
    whiteSpace: wraps ? "pre-wrap" : "pre",
    overflowWrap: wraps ? "break-word" : "normal",
    textAlign: style.align,
    padding: `${padTop}px ${style.padX}px`,
    width: `${w}px`,
    height: `${h}px`,
    zIndex: "1",
  };
}
