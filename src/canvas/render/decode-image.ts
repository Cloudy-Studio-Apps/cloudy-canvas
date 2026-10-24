import type { Size } from "../geometry.types";
import { imageHeaderSize } from "../image";
import type { DecodedImage } from "./decode-image.types";
import { isSvg, rasterizeSvg, SVG_RASTER_SIZE, svgRasterSize } from "./svg-image";

/**
 * The size an image file counts as having, read without decoding it: a raster's from its header,
 * an SVG's from its `viewBox` (see `svgRasterSize`); `null` when neither says (decode it then).
 */
export function knownImageSize(data: Uint8Array): Size | null {
  return isSvg(data) ? svgRasterSize(data) : imageHeaderSize(data);
}

/** Whether a file is drawn at any size (an SVG) rather than having pixels of its own. */
export function isVectorImage(data: Uint8Array): boolean {
  return isSvg(data);
}

/**
 * Decodes an image file into a bitmap about `pixels` on its long side: an SVG is drawn at that
 * size, a raster scaled down to it (never up). Also returns the size the picture counts as
 * having (`natural`, when it's known already, saves reading it).
 */
export async function decodeImage(
  data: Uint8Array,
  pixels: number,
  natural: Size | null = knownImageSize(data),
): Promise<DecodedImage> {
  const long = Math.max(1, Math.round(pixels));
  if (isSvg(data)) {
    const bitmap = await rasterizeSvg(data, long);
    return { bitmap, natural: natural ?? scaledTo(bitmapSize(bitmap), SVG_RASTER_SIZE) };
  }
  const blob = new Blob([data as Uint8Array<ArrayBuffer>]);
  if (natural) {
    const scale = long / Math.max(natural.w, natural.h);
    const bitmap = await (scale >= 1
      ? createImageBitmap(blob)
      : createImageBitmap(blob, resizeTo(natural, scale)));
    return { bitmap, natural };
  }
  // No header to read: decode it whole, then scale the copy down.
  const whole = await createImageBitmap(blob);
  const size = bitmapSize(whole);
  const scale = long / Math.max(size.w, size.h);
  if (scale >= 1) return { bitmap: whole, natural: size };
  const bitmap = await createImageBitmap(whole, resizeTo(size, scale));
  whole.close();
  return { bitmap, natural: size };
}

function bitmapSize(bitmap: ImageBitmap): Size {
  return { w: bitmap.width, h: bitmap.height };
}

/** `size` scaled to `long` on its long side. */
function scaledTo(size: Size, long: number): Size {
  const scale = long / Math.max(size.w, size.h, 1);
  return { w: Math.max(1, Math.round(size.w * scale)), h: Math.max(1, Math.round(size.h * scale)) };
}

function resizeTo(size: Size, scale: number): ImageBitmapOptions {
  return {
    resizeWidth: Math.max(1, Math.round(size.w * scale)),
    resizeHeight: Math.max(1, Math.round(size.h * scale)),
    resizeQuality: "high",
  };
}
