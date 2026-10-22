import type { FillStyle, Graphics } from "pixi.js";

import type { Gradient } from "../gradient";

import type { Rect } from "../geometry.types";
import type { ImageFit } from "./element-view.types";

/** What a vector paint can paint with besides flat colors. */
export interface PaintTools {
  /**
   * A fill (or, spread into a stroke, a stroke) of `gradient` laid on `box` (local coordinates),
   * at `alpha`. Its texture is kept while the layer shows it.
   */
  gradient(gradient: Gradient, box: Rect, alpha: number): FillStyle;
}

/**
 * A vector paint (a fill or a stroke): `draw` traces and paints it into `g` (already cleared),
 * with `tools` for gradients.
 */
export interface ShapePaintLayer {
  kind: "shape";
  draw(g: Graphics, tools: PaintTools): void;
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
