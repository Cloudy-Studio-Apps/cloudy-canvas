import type { ElementView, PaintLayer } from "@canvas";
import type { Graphics } from "pixi.js";

import type { DesignNode, StrokeShape } from "./design-node.types";
import type { Paint } from "./paint.types";

/**
 * Draws a node's visible fills, bottom to top, then its visible strokes, over the shape `outline`
 * traces (in local coordinates): solid paints are filled or stroked, image paints are clipped to
 * the outline. The node's opacity and visibility apply to all of them; `strokeShape` rounds the
 * strokes' ends and corners (e.g. a pencil line).
 */
export function drawPaints(
  view: ElementView,
  node: DesignNode,
  outline: (g: Graphics) => void,
  strokeShape: StrokeShape = {},
): void {
  const layers: PaintLayer[] = [];
  for (const paint of node.fills) {
    if (paint.visible) layers.push(fillLayer(paint, node, outline));
  }
  if (node.strokeWeight > 0) {
    for (const paint of node.strokes) {
      // Image strokes aren't supported; they're skipped.
      if (!paint.visible || paint.type !== "solid") continue;
      layers.push({
        kind: "shape",
        draw: (g) => {
          outline(g);
          g.stroke({
            color: paint.color,
            alpha: paint.opacity,
            width: node.strokeWeight,
            ...strokeShape,
          });
        },
      });
    }
  }
  view.setPaints(layers, { alpha: node.opacity, visible: node.visible });
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
    draw: (g) => {
      outline(g);
      g.fill({ color: paint.color, alpha: paint.opacity });
    },
  };
}
