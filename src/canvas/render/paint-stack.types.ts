import type { Graphics } from "pixi.js";

import type { Rect } from "../geometry.types";
import type { ImageFit } from "./element-view.types";

/** A vector paint (a fill or a stroke): `draw` traces and paints it into `g` (already cleared). */
export interface ShapePaintLayer {
  kind: "shape";
  draw(g: Graphics): void;
}

/** An image asset fitted into `box` (local coordinates) and clipped to the outline `mask` traces. */
export interface ImagePaintLayer {
  kind: "image";
  assetId: string;
  box: Rect;
  fit: ImageFit;
  /** 0–1. */
  alpha: number;
  /** Traces the clip outline into `g` (filled by the stack). */
  mask(g: Graphics): void;
}

/** One paint of an element, drawn by `ElementView.setPaints`. */
export type PaintLayer = ShapePaintLayer | ImagePaintLayer;

export interface PaintStackOptions {
  /** 0–1, for every layer together. */
  alpha: number;
  visible: boolean;
}
