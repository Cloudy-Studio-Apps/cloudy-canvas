import type { Graphics } from "pixi.js";

import type { DesignNode } from "./design-node.types";

/**
 * Paints a node's visible fills, then its visible strokes, over the shape `outline` traces (called
 * once per paint, since each fill or stroke consumes the path).
 */
export function drawPaints(g: Graphics, node: DesignNode, outline: (g: Graphics) => void): void {
  for (const paint of node.fills) {
    if (!paint.visible) continue;
    outline(g);
    g.fill({ color: paint.color, alpha: paint.opacity });
  }
  if (node.strokeWeight <= 0) return;
  for (const paint of node.strokes) {
    if (!paint.visible) continue;
    outline(g);
    g.stroke({ color: paint.color, alpha: paint.opacity, width: node.strokeWeight });
  }
}
