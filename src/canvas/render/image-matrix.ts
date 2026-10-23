import { Matrix } from "pixi.js";

import { IDENTITY_TRANSFORM, invertAffine, multiplyAffine } from "../gradient";
import type { Rect, Size } from "../geometry.types";
import type { ImageTransform } from "../image";

/**
 * The Pixi matrix placing a sprite of a `texture`-sized picture in `box` (local coordinates) as
 * `transform` says: texture pixels to the image's normalized space, to the box's, to the box.
 */
export function imageMatrix(transform: ImageTransform, box: Rect, texture: Size): Matrix {
  const toBox: ImageTransform = [
    [box.w, 0, box.x],
    [0, box.h, box.y],
  ];
  const fromPixels: ImageTransform = [
    [1 / Math.max(texture.w, 1e-9), 0, 0],
    [0, 1 / Math.max(texture.h, 1e-9), 0],
  ];
  const back = invertAffine(transform) ?? IDENTITY_TRANSFORM;
  const [[a, c, tx], [b, d, ty]] = multiplyAffine(multiplyAffine(toBox, back), fromPixels);
  return new Matrix(a, b, c, d, tx, ty);
}
