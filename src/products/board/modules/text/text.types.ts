import type { CanvasElement, ElementDefaults } from "@canvas";

/** A free text label, sized to its (unwrapped) text. */
export interface TextElement extends CanvasElement {
  type: "text";
  color: string;
  text: string;
  fontSize: number;
}

export interface TextDefaults extends ElementDefaults {
  fontSize: number;
  /** The font sizes agents may set. */
  minFontSize: number;
  maxFontSize: number;
}
