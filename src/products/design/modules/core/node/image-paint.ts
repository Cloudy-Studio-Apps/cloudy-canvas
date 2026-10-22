import type { ImagePaint, ImageScaleMode } from "./paint.types";

/** A visible, opaque image paint of a document asset. */
export function imagePaint(assetId: string, scaleMode: ImageScaleMode = "fill"): ImagePaint {
  return { type: "image", assetId, scaleMode, opacity: 1, visible: true };
}
