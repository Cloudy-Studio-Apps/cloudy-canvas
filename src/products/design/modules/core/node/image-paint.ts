import {
  fitTransform,
  IDENTITY_TRANSFORM,
  type ImagePlacement,
  type ImageRotation,
  type Size,
} from "@canvas";

import type { ImagePaint, ImageScaleMode } from "./paint.types";

/** A tile's size as a share of the picture's pixel size, when a paint doesn't say (Figma's). */
export const DEFAULT_TILE_SCALE = 0.5;

/** Every quarter turn, in order. */
export const IMAGE_ROTATIONS: readonly ImageRotation[] = [0, 90, 180, 270];

/** A visible, opaque image paint of a document asset. */
export function imagePaint(assetId: string, scaleMode: ImageScaleMode = "fill"): ImagePaint {
  return { type: "image", assetId, scaleMode, opacity: 1, visible: true };
}

/** How an image paint is drawn in its node's box. */
export function imagePlacement(paint: ImagePaint): ImagePlacement {
  const rotation = paint.rotation ?? 0;
  switch (paint.scaleMode) {
    case "fit":
      return { mode: "contain", rotation };
    case "crop":
      return { mode: "transform", transform: paint.transform ?? IDENTITY_TRANSFORM };
    case "tile":
      return { mode: "tile", scale: paint.scalingFactor ?? DEFAULT_TILE_SCALE, rotation };
    default:
      return { mode: "cover", rotation };
  }
}

/** `rotation` a quarter turn further clockwise. */
export function nextRotation(rotation: ImageRotation = 0): ImageRotation {
  return ((rotation + 90) % 360) as ImageRotation;
}

/**
 * `paint` as a crop that shows what it showed in a box of `box` size (a picture of `image` size):
 * what the paint picker's Crop and the Crop image command start from.
 */
export function toCropPaint(paint: ImagePaint, box: Size, image: Size): ImagePaint {
  if (paint.scaleMode === "crop") return paint;
  const mode = paint.scaleMode === "fit" ? "contain" : "cover";
  const crop: ImagePaint = {
    ...paint,
    scaleMode: "crop",
    transform: fitTransform(mode, box, image, paint.rotation ?? 0),
  };
  delete crop.rotation;
  delete crop.scalingFactor;
  return crop;
}
