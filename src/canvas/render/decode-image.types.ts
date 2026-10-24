import type { Size } from "../geometry.types";

/** A decoded picture, and the size it counts as having (its own pixels; an SVG's raster size). */
export interface DecodedImage {
  bitmap: ImageBitmap;
  natural: Size;
}
