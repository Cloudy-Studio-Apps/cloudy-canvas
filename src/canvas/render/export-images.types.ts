import type { Texture } from "pixi.js";

import type { Size } from "../geometry.types";

/** Where `ExportImages` reads image files and sizes from. */
export interface ExportImagesHost {
  /** The encoded image file stored under an asset id. */
  read(assetId: string): Uint8Array | undefined;
  /** The picture's size when its file's header doesn't say (the canvas decoded it already). */
  naturalSize(assetId: string): Size | null;
  /** A canvas texture of the asset at least `pixels` on its long side, if one is loaded. */
  cached(assetId: string, pixels: number): Texture | null;
  /** The longest side a texture may have (the GPU's limit, capped to keep memory in bounds). */
  maxPixels: number;
}
