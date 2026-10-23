import { ColorMatrixFilter, Container, Graphics, Matrix, Rectangle } from "pixi.js";

import { intersectRects, rectsIntersect } from "../../geometry";
import { fillPath } from "../../path";
import type { Rect } from "../../geometry.types";
import type { ElementMask, MaskShape } from "../layer-placement.types";
import { MaskSource } from "./mask-source";

/** World units of the mask drawn past the view's edges, so soft edges at the border stay right. */
const CULL_MARGIN = 2;

/** A vector mask's outline: a stencil, so it's crisp at any zoom. */
class MaskShapeGraphics extends Graphics {
  readonly order = "";
}

let luminance: ColorMatrixFilter | null = null;
let solid: ColorMatrixFilter | null = null;

/** Puts each pixel's brightness (Rec. 709, times its opacity) in the red channel the mask reads. */
function luminanceFilter(): ColorMatrixFilter {
  if (!luminance) {
    luminance = new ColorMatrixFilter();
    const l = [0.2126, 0.7152, 0.0722, 0, 0] as const;
    luminance.matrix = [...l, ...l, ...l, 0, 0, 0, 1, 0];
  }
  return luminance;
}

/** Makes every pixel that shows anything fully opaque: a vector mask of what has no outline. */
function solidFilter(): ColorMatrixFilter {
  if (!solid) {
    solid = new ColorMatrixFilter();
    solid.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 255, 0];
  }
  return solid;
}

/**
 * One mask on the canvas: a container holding what the mask masks (views, and the scopes of masks
 * nested in it), masked by its `source`. It sits in the element layer (or an enclosing scope)
 * where the mask element is in the drawing order.
 */
export class MaskScopeView extends Container {
  /** The mask element's drawing order key. */
  order = "";
  readonly source = new MaskSource();
  private shape: MaskShapeGraphics | null = null;
  /** The mask's mode as last applied (its outline is traced again on every sync). */
  private applied = "";
  private bounds: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private inverted = false;

  constructor(readonly maskId: string) {
    super();
    this.addChild(this.source);
  }

  /** Masks the scope as `mask` says (its mode, inversion and outline). */
  apply(mask: ElementMask): void {
    this.bounds = mask.bounds;
    this.inverted = mask.inverted;
    const vector = mask.mode === "vector" && mask.shape !== null;
    const look = `${mask.mode}|${mask.inverted}|${vector}`;
    if (look !== this.applied) {
      this.applied = look;
      this.mask = null;
      this.shape?.destroy();
      this.shape = null;
      this.source.filters = null;
      if (vector) {
        this.shape = new MaskShapeGraphics();
        this.addChildAt(this.shape, 0);
        this.setMask({ mask: this.shape, inverse: mask.inverted });
      } else {
        if (mask.mode === "luminance") this.source.filters = [luminanceFilter()];
        if (mask.mode === "vector") this.source.filters = [solidFilter()];
        this.setMask({
          mask: this.source,
          inverse: mask.inverted,
          channel: mask.mode === "luminance" ? "red" : "alpha",
        });
      }
    }
    if (this.shape && mask.shape) traceShapes(this.shape, mask.shape);
  }

  /**
   * Skips drawing the scope while the mask is outside `visible` (a world rect), and renders only
   * the part of the mask on screen into its texture.
   */
  cull(visible: Rect): void {
    const shown = this.inverted || rectsIntersect(this.bounds, visible);
    if (this.culled === shown) this.culled = !shown;
    const area = intersectRects(this.bounds, {
      x: visible.x - CULL_MARGIN,
      y: visible.y - CULL_MARGIN,
      w: visible.w + CULL_MARGIN * 2,
      h: visible.h + CULL_MARGIN * 2,
    });
    // An empty texture can't be made: a mask off screen is rendered from a pixel of it.
    const { x, y } = area;
    const w = Math.max(area.w, 1);
    const h = Math.max(area.h, 1);
    const current = this.source.boundsArea;
    if (current?.x === x && current.y === y && current.width === w && current.height === h) return;
    this.source.boundsArea = new Rectangle(x, y, w, h);
  }
}

/** Fills each outline where its element sits. */
function traceShapes(g: Graphics, shapes: readonly MaskShape[]): void {
  g.clear();
  for (const shape of shapes) {
    const turn = (-shape.rotation * Math.PI) / 180;
    g.setTransform(new Matrix().rotate(turn).translate(shape.x, shape.y));
    fillPath(g, shape.path, { color: 0xffffff });
  }
  g.resetTransform();
}
