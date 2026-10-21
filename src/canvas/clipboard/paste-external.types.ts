import type { CanvasElement } from "../elements";

/** An image pasted from outside the app, already stored in the document. */
export interface PastedImage {
  /** The document asset holding the image file. */
  assetId: string;
  /** Its size in pixels. */
  width: number;
  height: number;
}

/** An element made from something outside the app, not added yet, with the asset it shows. */
export interface ExternalElement {
  el: CanvasElement;
  /** A new document asset to add with it (an image's file). */
  asset?: { id: string; data: Uint8Array };
}
