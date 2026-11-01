import { Container, Rectangle } from "pixi.js";

import { intersectRects } from "../../geometry";
import { num } from "./svg-format";
import type { FlattenOptions, SvgContext } from "./svg-context.types";

/** The longest side a picture can have on the GPU. */
const MAX_SIDE = 8192;
/** Units past the bounds, so soft edges aren't cut. */
const EDGE = 1;

/**
 * What can't be written as SVG: `node` drawn as a picture, in its parent's coordinates, with its
 * place, opacity and masks in it. Everything else in the document stays vector.
 */
export function flatten(
  node: Container,
  w: SvgContext,
  { reach = 0, world = false }: FlattenOptions = {},
): string {
  const parent = node.parent;
  if (!parent) return "";
  const index = parent.getChildIndex(node);
  // Drawn from a holder, so the node's own transform and filters count as they do on the canvas.
  const holder = new Container();
  holder.addChild(node);
  try {
    const { minX, minY, width, height } = holder.getLocalBounds();
    if (width <= 0 || height <= 0) return "";
    const margin = reach + EDGE;
    const grown = {
      x: minX - margin,
      y: minY - margin,
      w: width + margin * 2,
      h: height + margin * 2,
    };
    const { x, y, w: frameW, h: frameH } = world ? intersectRects(grown, w.rect) : grown;
    if (frameW <= 0 || frameH <= 0) return "";
    const canvas = w.renderer.extract.canvas({
      target: holder,
      frame: new Rectangle(x, y, frameW, frameH),
      resolution: Math.min(w.flattenScale, MAX_SIDE / Math.max(frameW, frameH)),
      clearColor: [0, 0, 0, 0],
      antialias: true,
    }) as HTMLCanvasElement;
    return (
      `<image x="${num(x)}" y="${num(y)}" width="${num(frameW)}" height="${num(frameH)}"` +
      ` preserveAspectRatio="none" xlink:href="${canvas.toDataURL("image/png")}"/>`
    );
  } finally {
    parent.addChildAt(node, index);
    holder.destroy();
  }
}
