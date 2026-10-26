/** An image's pixels (RGBA, as `ImageData` holds them). */
export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/** Which pixels an image's colors favor: all alike, the saturated ones, or the quiet ones. */
export type ImageMood = "balanced" | "vivid" | "muted";

/** A color found in an image, with where it is (0–1 of its size) and how many pixels it covers. */
export interface ImageColor {
  hex: string;
  x: number;
  y: number;
  count: number;
}

/** An image the file shows (a layer's image fill). */
export interface DocImage {
  assetId: string;
  /** The first layer showing it. */
  name: string;
  pageId: string;
}

/** A paint a layer uses: its node and the field holding the color (`fills.0.color`). */
export interface FillRef {
  nodeId: string;
  path: string;
}

/** A solid color layers use without a variable, and where. */
export interface FileFill {
  hex: string;
  refs: FillRef[];
}

/** Near-duplicate fills merged under the most used one. */
export interface FillGroup {
  hex: string;
  /** How many paints use it or a color merged into it. */
  count: number;
  members: FileFill[];
}

/** A color read from pasted text or a file; named ones keep the name as their role. */
export interface ImportedColor {
  hex: string;
  name?: string;
}
