import { cropTransform, type ImageRotation, type ImageTransform } from "@canvas";

import { readTransform } from "./gradient-args";
import { IMAGE_ROTATIONS } from "./image-paint";
import type { ImagePaint } from "./paint.types";

const SCALE_MODES: readonly ImagePaint["scaleMode"][] = ["fill", "fit", "crop", "tile"];

/**
 * An agent's image paint: `{ type: "image", assetId, scaleMode?, crop?: { x, y, w, h } |
 * transform?, scalingFactor?, rotation?, opacity?, visible? }`.
 */
export function readImagePaint(
  paint: Record<string, unknown>,
  key: string,
  shared: Pick<ImagePaint, "opacity" | "visible">,
): ImagePaint {
  if (typeof paint.assetId !== "string" || paint.assetId === "") {
    throw new Error(`"${key}.assetId" must be the asset id of an image (see add_image).`);
  }
  const scaleMode = (paint.scaleMode ?? "fill") as ImagePaint["scaleMode"];
  if (!SCALE_MODES.includes(scaleMode)) {
    throw new Error(`"${key}.scaleMode" must be one of: ${SCALE_MODES.join(", ")}.`);
  }
  const read: ImagePaint = { type: "image", assetId: paint.assetId, scaleMode, ...shared };
  if (scaleMode === "crop") read.transform = readCrop(paint, key);
  if (scaleMode === "tile" && paint.scalingFactor !== undefined) {
    const factor = paint.scalingFactor;
    if (typeof factor !== "number" || !(factor > 0) || factor > 100) {
      throw new Error(`"${key}.scalingFactor" must be a number above 0 (1 is the picture's size).`);
    }
    read.scalingFactor = factor;
  }
  if (scaleMode !== "crop" && paint.rotation !== undefined) {
    if (!IMAGE_ROTATIONS.includes(paint.rotation as ImageRotation)) {
      throw new Error(`"${key}.rotation" must be one of: ${IMAGE_ROTATIONS.join(", ")}.`);
    }
    read.rotation = paint.rotation as ImageRotation;
  }
  return read;
}

/** A crop's placement: `crop` (the part of the picture shown, fractions) or a `transform`. */
function readCrop(paint: Record<string, unknown>, key: string): ImageTransform {
  if (paint.transform !== undefined) return readTransform(paint.transform, `${key}.transform`);
  if (paint.crop === undefined) {
    throw new Error(`"${key}" needs "crop" ({ x, y, w, h }, fractions of the picture) to crop.`);
  }
  const crop = paint.crop as Record<string, unknown>;
  const valid =
    typeof crop === "object" &&
    crop !== null &&
    ["x", "y", "w", "h"].every((k) => Number.isFinite(crop[k])) &&
    (crop.w as number) > 0 &&
    (crop.h as number) > 0;
  if (!valid) {
    throw new Error(`"${key}.crop" must be { x, y, w, h }, fractions of the picture (w, h > 0).`);
  }
  return cropTransform({
    x: crop.x as number,
    y: crop.y as number,
    w: crop.w as number,
    h: crop.h as number,
  });
}
