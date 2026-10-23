import { fillPath, strokePath, type ElementView, type PaintLayer, type PaintTools } from "@canvas";

import type { DesignNode, NodeGeometry, PaintOutline, StrokeShape } from "./design-node.types";
import type { PaintTracer } from "./draw-paints.types";
import { isGradientPaint } from "./gradient-paint";
import type { Paint } from "./paint.types";

/**
 * Draws a node's visible fills, bottom to top, then its visible strokes, over its `geometry` (in
 * local coordinates; holes stay open): solid paints are filled or stroked, gradients are laid on
 * the node's box, image paints are clipped to the fill. Fills next to each other share one
 * drawing (fewer objects for the GPU). The node's opacity and visibility apply to all of them;
 * `strokeShape` rounds the strokes' ends and corners (e.g. a pencil line). Kinds that trace their
 * shape by hand (plugins') give a `PaintOutline` instead.
 */
export function drawPaints(
  view: ElementView,
  node: DesignNode,
  shape: NodeGeometry | PaintOutline,
  strokeShape: StrokeShape = {},
): void {
  const tracer = tracerOf(shape);
  const layers: PaintLayer[] = [];
  let fills: Exclude<Paint, { type: "image" }>[] = [];
  const flush = () => {
    if (fills.length === 0) return;
    const run = fills;
    fills = [];
    layers.push({
      kind: "shape",
      draw: (g, tools) => {
        for (const paint of run) tracer.fill(g, paintStyle(paint, node, tools));
      },
    });
  };
  for (const paint of node.fills) {
    if (!paint.visible) continue;
    if (paint.type !== "image") {
      fills.push(paint);
      continue;
    }
    flush();
    layers.push({
      kind: "image",
      assetId: paint.assetId,
      box: { x: 0, y: 0, w: node.w, h: node.h },
      fit: paint.scaleMode === "fit" ? "contain" : "cover",
      alpha: paint.opacity,
      mask: (g) => tracer.fill(g, { color: 0xffffff }),
    });
  }
  flush();
  if (node.strokeWeight > 0) {
    // Image strokes aren't supported; they're skipped.
    const strokes = node.strokes.filter((paint) => paint.visible && paint.type !== "image");
    if (strokes.length > 0) {
      layers.push({
        kind: "shape",
        draw: (g, tools) => {
          for (const paint of strokes) {
            if (paint.type === "image") continue;
            tracer.stroke(g, {
              ...paintStyle(paint, node, tools),
              width: node.strokeWeight,
              ...strokeShape,
            });
          }
        },
      });
    }
  }
  view.setPaints(layers, { alpha: node.opacity, visible: node.visible });
}

function tracerOf(shape: NodeGeometry | PaintOutline): PaintTracer {
  if (typeof shape === "function" || typeof shape.fill === "function") {
    const outline = shape as PaintOutline;
    const fill = typeof outline === "function" ? outline : outline.fill;
    const stroke = typeof outline === "function" ? outline : outline.stroke;
    return {
      fill: (g, style) => {
        fill(g);
        g.fill(style);
      },
      stroke: (g, style) => {
        stroke(g);
        g.stroke(style);
      },
    };
  }
  const geometry = shape as NodeGeometry;
  return {
    fill: (g, style) => fillPath(g, geometry.fill, style),
    stroke: (g, style) => strokePath(g, geometry.stroke, style),
  };
}

/** A solid or gradient paint as a Pixi fill style, on the node's box. */
function paintStyle(paint: Exclude<Paint, { type: "image" }>, node: DesignNode, tools: PaintTools) {
  return isGradientPaint(paint)
    ? tools.gradient(paint, { x: 0, y: 0, w: node.w, h: node.h }, paint.opacity)
    : { color: paint.color, alpha: paint.opacity };
}
