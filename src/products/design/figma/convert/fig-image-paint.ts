import { invertAffine, type ImageRotation, type ImageTransform } from "@canvas";
import type { FigPaint } from "@canvas/figma";

import { imagePaint, IMAGE_ROTATIONS, type ImagePaint } from "../../modules";

/**
 * A Figma image paint's look as ours: FIT and FILL as they are, STRETCH (Figma's crop) with its
 * image transform, TILE with its scale; quarter turns are kept.
 */
export function convertImagePaint(paint: FigPaint, assetId: string): ImagePaint {
  const mode = paint.imageScaleMode;
  if (mode === "STRETCH") {
    const transform = imageTransform(paint);
    return transform ? { ...imagePaint(assetId, "crop"), transform } : imagePaint(assetId);
  }
  const converted = imagePaint(assetId, mode === "FIT" ? "fit" : mode === "TILE" ? "tile" : "fill");
  if (mode === "TILE" && paint.scale !== undefined && paint.scale > 0) {
    converted.scalingFactor = paint.scale;
  }
  const rotation = quarterTurn(paint.rotation);
  if (rotation) converted.rotation = rotation;
  return converted;
}

function imageTransform({ transform: m }: FigPaint): ImageTransform | null {
  if (!m) return null;
  const transform: ImageTransform = [
    [m.m00, m.m01, m.m02],
    [m.m10, m.m11, m.m12],
  ];
  return invertAffine(transform) ? transform : null;
}

function quarterTurn(degrees: number | undefined): ImageRotation | null {
  if (degrees === undefined) return null;
  const turn = (((Math.round(degrees / 90) * 90) % 360) + 360) % 360;
  return IMAGE_ROTATIONS.includes(turn as ImageRotation) ? (turn as ImageRotation) : null;
}
