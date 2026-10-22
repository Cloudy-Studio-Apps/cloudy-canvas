import type { Gradient } from "@canvas";

/** A flat color. */
export interface SolidPaint {
  type: "solid";
  /** `#rrggbb`. */
  color: string;
  /** 0–1. */
  opacity: number;
  visible: boolean;
}

/** How an image paint covers its node: `fill` crops it to cover, `fit` shows all of it. */
export type ImageScaleMode = "fill" | "fit";

/** An image (a document asset) painted over the node's shape. */
export interface ImagePaint {
  type: "image";
  /** The document asset holding the image file. */
  assetId: string;
  scaleMode: ImageScaleMode;
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
