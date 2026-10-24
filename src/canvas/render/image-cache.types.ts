import type { Texture } from "pixi.js";

import type { Rect, Size } from "../geometry.types";
import type { ImagePlacement } from "../image";

/** Where `ImageCache` reads image files from, and whom it tells when one is ready. */
export interface ImageCacheHost {
  /** The encoded image file (PNG, JPEG, …) stored under an asset id. */
  read(assetId: string): Uint8Array | undefined;
  /** Called when a texture finished loading, so the canvas redraws. */
  onLoad(): void;
}

/**
 * Called when these assets' textures changed sharpness (a sharper one arrived, or one was let
 * go): the views showing them draw again to pick up `get`'s texture, before the old one is freed.
 */
export type ImageUpgradeListener = (assetIds: ReadonlySet<string>) => void;

/**
 * Where views get image textures: the canvas's `ImageCache`, or an export's `ExportImages`.
 * Textures may be smaller than the picture; views place them by their own size.
 */
export interface ImageTextures {
  /** The asset's texture if one is loaded, otherwise `null`. */
  get(assetId: string): Texture | null;
  /** Loads a texture of the asset; resolves to `null` when it can't be decoded. */
  load(assetId: string): Promise<Texture | null>;
  /** The picture's own size in pixels (its texture may be smaller), once it's known. */
  naturalSize(assetId: string): Size | null;
}

/** One picture a view shows: the asset, the box it's placed in (local units) and how. */
export interface ImageUse {
  assetId: string;
  box: Rect;
  placement: ImagePlacement;
}

/** How many pixels on its long side a texture of an asset should have to look sharp. */
export interface ImageDemand {
  assetId: string;
  pixels: number;
}

/** What `ImageCache` keeps of one asset. */
export interface CachedImage {
  /** The size the picture counts as having, once known. */
  natural: Size | null;
  /** Drawn at any size (an SVG), so levels aren't capped by `natural`. */
  vector: boolean;
  /** Its textures by level (pixels on the long side); the base one is never let go. */
  levels: Map<number, Texture>;
  /** The level `load` gives, and keeps. */
  base: number;
  /** The base level being decoded. */
  loading: Promise<Texture | null> | null;
  /** A sharper level being decoded, if any. */
  upgrading: number | null;
  /** The most the views showing it asked for in the latest demand round. */
  wanted: number;
  /** The demand round it was last asked for in. */
  seen: number;
}

/** How sharp the canvas shows a picture right now (see `ImageCache.quality`). */
export interface ImageQuality {
  /** The picture's own size in pixels (an SVG's counts as `SVG_RASTER_SIZE`). */
  natural: Size;
  /** The copy the canvas draws it from, or `null` while it loads. */
  shown: Size | null;
  /** Drawn at any size (an SVG). */
  vector: boolean;
  /** About how many device pixels its long side takes on screen now; `null` when it's out of view. */
  onScreen: number | null;
}
