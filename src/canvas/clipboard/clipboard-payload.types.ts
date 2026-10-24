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
  /** The assets they show (e.g. image files), base64 by asset id, so they paste into other files. */
  assets?: Record<string, string>;
  /** The variables they're bound to (`TokenRecord`s, checked when pasted). */
  tokens?: unknown[];
}

/** What `decodeClipboard` reads from a payload. */
export type DecodedClipboard = Required<
  Pick<ClipboardPayload, "elements" | "selected" | "assets" | "tokens">
>;
