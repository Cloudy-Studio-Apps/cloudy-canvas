import type { CanvasElement, ElementDefaults, Size } from "@canvas";

export interface StickyElement extends CanvasElement {
  type: "sticky";
  color: string;
  text: string;
}

export interface StickyDefaults extends ElementDefaults {
  size: Size;
  fontSize: number;
  /** Inner padding around the text. */
  padding: number;
}
