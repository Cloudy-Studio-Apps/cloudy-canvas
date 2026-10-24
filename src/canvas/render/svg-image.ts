/**
 * SVGs are drawn into a bitmap this many pixels on their long side unless asked for another size;
 * it's also the size they count as having (a tile's size, `ImageCache.naturalSize`).
 */
export const SVG_RASTER_SIZE = 512;
/** Added SVGs are at least this long on their long side: small icons scale up, as vectors can. */
const SVG_MIN_SIZE = 160;

/** Whether an image file is an SVG document (`createImageBitmap` can't decode those). */
export function isSvg(data: Uint8Array): boolean {
  const head = new TextDecoder().decode(data.subarray(0, 256)).trimStart();
  return head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"));
}

/**
 * Draws an SVG file into a bitmap `longSide` pixels on its long side, keeping the proportions of
 * its `viewBox`.
 */
export async function rasterizeSvg(
  data: Uint8Array,
  longSide = SVG_RASTER_SIZE,
): Promise<ImageBitmap> {
  const url = URL.createObjectURL(
    new Blob([data as Uint8Array<ArrayBuffer>], { type: "image/svg+xml" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = viewBoxRatio(data) ?? (image.naturalWidth / image.naturalHeight || 1);
    const w = Math.max(1, Math.round(ratio >= 1 ? longSide : longSide * ratio));
    const h = Math.max(1, Math.round(ratio >= 1 ? longSide / ratio : longSide));
    const canvas = new OffscreenCanvas(w, h);
    canvas.getContext("2d")?.drawImage(image, 0, 0, w, h);
    return await createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The size an SVG file is added at: its own size (`width`/`height`, else its `viewBox`), scaled up
 * to `SVG_MIN_SIZE` on its long side. `null` when it can't be decoded.
 */
export async function svgSize(data: Uint8Array): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(
    new Blob([data as Uint8Array<ArrayBuffer>], { type: "image/svg+xml" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const box = viewBoxSize(data);
    const width = image.naturalWidth || box?.w || 0;
    const height = image.naturalHeight || box?.h || 0;
    if (width <= 0 || height <= 0) return null;
    const scale = Math.max(1, SVG_MIN_SIZE / Math.max(width, height));
    return { width: width * scale, height: height * scale };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The size an SVG counts as having (`SVG_RASTER_SIZE` on its long side, in its `viewBox`'s
 * proportions), or `null` without a usable `viewBox`.
 */
export function svgRasterSize(data: Uint8Array): { w: number; h: number } | null {
  const ratio = viewBoxRatio(data);
  if (!ratio) return null;
  return ratio >= 1
    ? { w: SVG_RASTER_SIZE, h: Math.max(1, Math.round(SVG_RASTER_SIZE / ratio)) }
    : { w: Math.max(1, Math.round(SVG_RASTER_SIZE * ratio)), h: SVG_RASTER_SIZE };
}

/** Width over height from the SVG's `viewBox`, or `null` without a usable one. */
function viewBoxRatio(data: Uint8Array): number | null {
  const box = viewBoxSize(data);
  return box ? box.w / box.h : null;
}

/** The width and height of the SVG's `viewBox`, or `null` without a usable one. */
function viewBoxSize(data: Uint8Array): { w: number; h: number } | null {
  const text = new TextDecoder().decode(data.subarray(0, 1024));
  const match = /viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(text);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  return w > 0 && h > 0 ? { w, h } : null;
}
