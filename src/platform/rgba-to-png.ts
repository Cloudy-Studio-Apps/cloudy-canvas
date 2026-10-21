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

/** Decodes an image file (e.g. a PNG) into raw RGBA pixels, for Tauri's clipboard image. */
export async function pngToRgba(
  file: Blob,
): Promise<{ rgba: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = bitmap;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Couldn't read the image.");
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, width, height);
    return { rgba: new Uint8Array(data.buffer), width, height };
  } finally {
    bitmap.close();
  }
}
