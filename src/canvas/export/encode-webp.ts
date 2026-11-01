import type { WebpEncoder } from "@shared/core";

import { canvasBlob } from "./canvas-blob";

/**
 * A canvas as a WebP file. Webviews without a WebP encoder (WebKit's) quietly hand back PNG, which
 * must not be saved as `.webp`: those use `encoder` instead.
 */
export async function encodeWebp(
  canvas: HTMLCanvasElement,
  quality: number,
  encoder: WebpEncoder | null,
): Promise<Blob> {
  const native = await canvasBlob(canvas, "image/webp", quality);
  if (native.type === "image/webp") return native;
  if (!encoder) throw new Error("This app can't make WebP files here.");
  const copy = document.createElement("canvas");
  copy.width = canvas.width;
  copy.height = canvas.height;
  const context = copy.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Couldn't read the image.");
  context.drawImage(canvas, 0, 0);
  const pixels = context.getImageData(0, 0, copy.width, copy.height);
  return new Blob([(await encoder(pixels, quality)) as BlobPart], { type: "image/webp" });
}
