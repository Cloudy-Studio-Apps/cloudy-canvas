import { imageType } from "./image-type";
import type { ShrunkImage } from "./shrink-image.types";

/** WebP quality of pictures in the file: small, and hard to tell from the original on screen. */
const QUALITY = 0.85;

/**
 * A picture at most `longSide` pixels on its long side (never larger than it is), as WebP, which
 * keeps transparency. The original comes back when it can't be decoded or is already smaller.
 */
export async function shrinkImage(bytes: Uint8Array, longSide: number): Promise<ShrunkImage> {
  const original = { bytes, type: imageType(bytes) };
  try {
    const bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
    const scale = Math.min(1, longSide / Math.max(bitmap.width, bitmap.height));
    const canvas = new OffscreenCanvas(
      Math.max(1, Math.round(bitmap.width * scale)),
      Math.max(1, Math.round(bitmap.height * scale)),
    );
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await canvas.convertToBlob({ type: "image/webp", quality: QUALITY });
    // A browser without a WebP encoder hands back PNG; keep whichever is smaller.
    if (blob.size >= bytes.length && scale === 1) return original;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), type: blob.type };
  } catch {
    return original;
  }
}
