/** A picture to place on the canvas: its asset id, its bytes and its size in pixels. */
export interface PlacedImage {
  /** The document asset holding the file (`bytes` are stored under it when the file lacks it). */
  assetId: string;
  bytes: Uint8Array;
  width: number;
  height: number;
}
