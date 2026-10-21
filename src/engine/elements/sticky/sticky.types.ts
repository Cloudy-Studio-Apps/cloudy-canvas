import type { CanvasElement } from "../element.types";

export interface StickyElement extends CanvasElement {
  type: "sticky";
  color: string;
  text: string;
}
