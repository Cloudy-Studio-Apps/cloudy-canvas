import type { GradientTransform } from "../gradient";
import type { Rect } from "../geometry.types";

/**
 * Where an image sits in its layer, as Figma's `imageTransform`: the affine taking a point of the
 * layer's normalized box (0–1 on each axis) to the image's normalized space (0–1 across the
 * picture). The identity shows the whole picture stretched over the box.
 */
export type ImageTransform = GradientTransform;

/** The part of a picture shown, in the image's normalized space (an axis-aligned crop). */
export type ImageCrop = Rect;

/** A quarter turn of a picture, clockwise on screen. */
export type ImageRotation = 0 | 90 | 180 | 270;

/** How an image fills its box when it's drawn. */
export type ImagePlacement =
  /** Whole and centered (`contain`), or covering the box and cropped (`cover`). */
  | { mode: "contain" | "cover"; rotation?: ImageRotation }
  /** Placed by an `ImageTransform` (a free crop). */
  | { mode: "transform"; transform: ImageTransform }
  /** Repeated from the box's corner, each tile the picture's pixel size times `scale`. */
  | { mode: "tile"; scale: number; rotation?: ImageRotation };
