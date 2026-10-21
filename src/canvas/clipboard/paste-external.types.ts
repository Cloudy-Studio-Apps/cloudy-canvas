/** An image pasted from outside the app, already stored in the document. */
export interface PastedImage {
  /** The document asset holding the image file. */
  assetId: string;
  /** Its size in pixels. */
  width: number;
  height: number;
}
