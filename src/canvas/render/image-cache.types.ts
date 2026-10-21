/** Where `ImageCache` reads image files from, and whom it tells when one is ready. */
export interface ImageCacheHost {
  /** The encoded image file (PNG, JPEG, …) stored under an asset id. */
  read(assetId: string): Uint8Array | undefined;
  /** Called when a texture finished loading, so the canvas redraws. */
  onLoad(): void;
}
