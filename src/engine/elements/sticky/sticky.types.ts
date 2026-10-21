import type { Size } from "../../geometry.types";
import type { CanvasElement } from "../element.types";
import type { ElementDefaults } from "../element.kind.types";

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
