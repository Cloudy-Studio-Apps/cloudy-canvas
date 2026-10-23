import type { Gradient, ImageRotation, ImageTransform } from "@canvas";

/** A flat color. */
export interface SolidPaint {
  type: "solid";
  /** `#rrggbb`. */
  color: string;
  /** 0–1. */
  opacity: number;
  visible: boolean;
}

/**
 * How an image paint covers its node, as Figma's: `fill` crops it to cover, `fit` shows all of
 * it, `crop` shows the part its `transform` picks and `tile` repeats it at `scalingFactor`.
 */
export type ImageScaleMode = "fill" | "fit" | "crop" | "tile";

/** An image (a document asset) painted over the node's shape. */
export interface ImagePaint {
  type: "image";
  /** The document asset holding the image file. */
  assetId: string;
  scaleMode: ImageScaleMode;
  /** `crop`: where the picture sits in the node's box (the identity when missing). */
  transform?: ImageTransform;
  /** `tile`: a tile is the picture's pixel size times this (0.5 when missing). */
  scalingFactor?: number;
  /** `fill`, `fit` and `tile`: the picture turned by quarters, clockwise (0 when missing). */
  rotation?: ImageRotation;
  /** 0–1. */
  opacity: number;
  visible: boolean;
}

/** A gradient (linear, radial, angular or diamond) laid on the node's box. */
export interface GradientPaint extends Gradient {
  /** 0–1. */
  opacity: number;
  visible: boolean;
}

/** How a node's fill or stroke is painted. */
export type Paint = SolidPaint | ImagePaint | GradientPaint;

/** The kinds of paint (`Paint["type"]`). */
export type PaintType = Paint["type"];
