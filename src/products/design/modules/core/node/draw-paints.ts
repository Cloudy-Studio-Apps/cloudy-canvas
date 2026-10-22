import type { ElementView, PaintLayer, PaintTools } from "@canvas";
import type { Graphics } from "pixi.js";

import type { DesignNode, PaintOutline, StrokeShape } from "./design-node.types";
import { isGradientPaint } from "./gradient-paint";
import type { Paint } from "./paint.types";

/**
 * Draws a node's visible fills, bottom to top, then its visible strokes, over the shape `outline`
 * traces (in local coordinates; or `{ fill, stroke }` when what's filled differs from what's
 * stroked, e.g. a vector's regions and its segments): solid paints are filled or stroked,
 * gradients are laid on the node's box, image paints are clipped to the fill outline. The node's
 * opacity and visibility apply to all of them; `strokeShape` rounds the strokes' ends and corners
 * (e.g. a pencil line).
 */
export function drawPaints(
  view: ElementView,
  node: DesignNode,
  outline: PaintOutline,
  strokeShape: StrokeShape = {},
): void {
  const fillOutline = typeof outline === "function" ? outline : outline.fill;
  const strokeOutline = typeof outline === "function" ? outline : outline.stroke;
  const layers: PaintLayer[] = [];
  for (const paint of node.fills) {
    if (paint.visible) layers.push(fillLayer(paint, node, fillOutline));
  }
  if (node.strokeWeight > 0) {
    for (const paint of node.strokes) {
      // Image strokes aren't supported; they're skipped.
      if (!paint.visible || paint.type === "image") continue;
      layers.push({
        kind: "shape",
        draw: (g, tools) => {
          strokeOutline(g);
          g.stroke({ ...paintStyle(paint, node, tools), width: node.strokeWeight, ...strokeShape });
        },
      });
    }
  }
  view.setPaints(layers, { alpha: node.opacity, visible: node.visible });
}

/** A solid or gradient paint as a Pixi fill style, on the node's box. */
function paintStyle(paint: Exclude<Paint, { type: "image" }>, node: DesignNode, tools: PaintTools) {
  return isGradientPaint(paint)
    ? tools.gradient(paint, { x: 0, y: 0, w: node.w, h: node.h }, paint.opacity)
    : { color: paint.color, alpha: paint.opacity };
}

function fillLayer(paint: Paint, node: DesignNode, outline: (g: Graphics) => void): PaintLayer {
  if (paint.type === "image") {
    return {
      kind: "image",
      assetId: paint.assetId,
      box: { x: 0, y: 0, w: node.w, h: node.h },
      fit: paint.scaleMode === "fit" ? "contain" : "cover",
      alpha: paint.opacity,
      mask: outline,
    };
  }
  return {
    kind: "shape",
    draw: (g, tools) => {
      outline(g);
      g.fill(paintStyle(paint, node, tools));
    },
  };
}
