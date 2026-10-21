/** Encodes raw RGBA pixels (e.g. Tauri's clipboard image) as a PNG file. */
export function rgbaToPng(
  rgba: Uint8Array<ArrayBuffer>,
  width: number,
  height: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  const pixels = new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength);
  context.putImageData(new ImageData(pixels, width, height), 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
