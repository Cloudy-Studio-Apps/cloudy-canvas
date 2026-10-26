import type { PixelData } from "../..";

/** A loaded image's pixels at `width` px wide (its height in proportion). */
export function readPixels(image: HTMLImageElement, width: number): PixelData | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const g = canvas.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = g.getImageData(0, 0, canvas.width, canvas.height);
  return { data, width: canvas.width, height: canvas.height };
}

/** The color at a spot (0–1 of each side) of pixels. */
export function pixelAt(pixels: PixelData, x: number, y: number): [number, number, number] {
  const px = Math.min(pixels.width - 1, Math.max(0, Math.round(x * pixels.width)));
  const py = Math.min(pixels.height - 1, Math.max(0, Math.round(y * pixels.height)));
  const i = (py * pixels.width + px) * 4;
  return [pixels.data[i] ?? 0, pixels.data[i + 1] ?? 0, pixels.data[i + 2] ?? 0];
}

/** A copy about `width` px wide, keeping every few pixels: enough for finding colors quickly. */
export function downsample(pixels: PixelData, width: number): PixelData {
  const step = Math.max(1, Math.floor(pixels.width / width));
  const w = Math.floor(pixels.width / step);
  const h = Math.floor(pixels.height / step);
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const from = (y * step * pixels.width + x * step) * 4;
      data.set(pixels.data.subarray(from, from + 4), (y * w + x) * 4);
    }
  }
  return { data, width: w, height: h };
}
