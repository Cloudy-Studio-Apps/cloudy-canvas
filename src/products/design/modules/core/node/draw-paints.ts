import {
  fillPath,
  pathBounds,
  strokePath,
  type ElementView,
  type PaintLayer,
  type Rect,
} from "@canvas";
import type { DesignNode, NodeGeometry, NodeStroke, PaintOutline } from "./design-node.types";
import type { StrokeDrawing, Trace } from "./draw-paints.types";
import { isGradientPaint } from "./gradient-paint";
import { imagePlacement } from "./image-paint";
import { hasVisibleStroke, strokeShapeOf } from "./node-stroke";
import type { Paint } from "./paint.types";

/**
 * Draws a node's visible fills, bottom to top, then its visible strokes, over its `geometry` (in
 * local coordinates; holes stay open): solid paints are filled or stroked, gradients are laid on
 * the node's box, image paints are clipped to what they cover. Paints next to each other share
 * one drawing (fewer objects for the GPU). The node's opacity and visibility apply to all of
 * them. `stroke` is how its strokes are drawn (`DesignNodeKind.strokeOf`); without it they follow
 * the geometry's stroke path (or the hand-traced outline of plugins' kinds) centered.
 */
export function drawPaints(
  view: ElementView,
  node: DesignNode,
  shape: NodeGeometry | PaintOutline,
  stroke?: NodeStroke | null,
): void {
  const box = { x: 0, y: 0, w: node.w, h: node.h };
  const layers: PaintLayer[] = [];
  addPaints(layers, node.fills, node, box, fillTrace(shape));
  const strokes = stroke === undefined ? defaultStroke(node, shape) : stroke;
  if (strokes && hasVisibleStroke(node)) {
    addPaints(layers, node.strokes, node, strokeBox(strokes, box), strokeTrace(strokes));
  }
  view.setPaints(layers, { alpha: node.opacity, visible: node.visible });
}

/**
 * Adds a list of paints: runs of solid and gradient ones as one shape layer, image ones as image
 * layers clipped to what `trace` covers, fitted into `box`.
 */
function addPaints(
  layers: PaintLayer[],
  paints: readonly Paint[],
  node: DesignNode,
  box: Rect,
  trace: Trace,
): void {
  let run: Exclude<Paint, { type: "image" }>[] = [];
  const flush = () => {
    if (run.length === 0) return;
    const painted = run;
    run = [];
    layers.push({
      kind: "shape",
      draw: (g, tools) => {
        for (const paint of painted) {
          trace(
            g,
            isGradientPaint(paint)
              ? tools.gradient(paint, { x: 0, y: 0, w: node.w, h: node.h }, paint.opacity)
              : { color: paint.color, alpha: paint.opacity },
          );
        }
      },
    });
  };
  for (const paint of paints) {
    if (!paint.visible) continue;
    if (paint.type !== "image") {
      run.push(paint);
      continue;
    }
    flush();
    layers.push({
      kind: "image",
      assetId: paint.assetId,
      box,
      placement: imagePlacement(paint),
      alpha: paint.opacity,
      mask: (g) => trace(g, { color: 0xffffff }),
    });
  }
  flush();
}

function fillTrace(shape: NodeGeometry | PaintOutline): Trace {
  if (isGeometry(shape)) return (g, style) => fillPath(g, shape.fill, style);
  const outline = typeof shape === "function" ? shape : shape.fill;
  return (g, style) => {
    outline(g);
    g.fill(style);
  };
}

function strokeTrace(stroke: StrokeDrawing): Trace {
  if (stroke.kind === "area") return (g, style) => fillPath(g, stroke.area, style);
  const line = { width: stroke.width, ...stroke.shape };
  if (stroke.kind === "path") {
    return (g, style) => strokePath(g, stroke.path, { ...(style as object), ...line });
  }
  return (g, style) => {
    stroke.outline(g);
    g.stroke({ ...(style as object), ...line });
  };
}

/**
 * What a node's strokes follow when no `NodeStroke` is given: its geometry's stroke path or a
 * hand-traced outline, centered, with the node's weight, cap and join.
 */
function defaultStroke(node: DesignNode, shape: NodeGeometry | PaintOutline): StrokeDrawing {
  const line = { width: node.strokeWeight, shape: strokeShapeOf(node) };
  if (isGeometry(shape)) return { kind: "path", path: shape.stroke, ...line };
  return { kind: "outline", outline: typeof shape === "function" ? shape : shape.stroke, ...line };
}

/** Where an image stroke's picture is laid: round the stroke's area, or the box. */
function strokeBox(stroke: StrokeDrawing, box: Rect): Rect {
  if (stroke.kind === "area") return pathBounds(stroke.area) ?? box;
  const half = stroke.width / 2;
  return { x: box.x - half, y: box.y - half, w: box.w + stroke.width, h: box.h + stroke.width };
}

function isGeometry(shape: NodeGeometry | PaintOutline): shape is NodeGeometry {
  return typeof shape !== "function" && typeof shape.fill !== "function";
}
