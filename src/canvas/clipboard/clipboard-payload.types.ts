import type { CanvasElement } from "../elements";

/** Elements on the clipboard, as JSON text. */
export interface ClipboardPayload {
  format: "cloudy-canvas";
  version: 1;
  /** The product they're from; other products don't paste them. */
  product: string;
  elements: CanvasElement[];
  /** The ids that were selected (the rest came along with them, e.g. a section's contents). */
  selected: string[];
}
