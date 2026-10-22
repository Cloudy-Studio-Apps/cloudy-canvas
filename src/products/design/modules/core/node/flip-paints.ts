import { flipGradient } from "@canvas";

import type { DesignNode } from "./design-node.types";
import type { FlipAxis } from "./flip.types";
import { isGradientPaint } from "./gradient-paint";
import type { Paint } from "./paint.types";

function flipped(paints: readonly Paint[], axis: FlipAxis): Paint[] {
  return paints.map((paint) =>
    isGradientPaint(paint) ? { ...paint, transform: flipGradient(paint.transform, axis) } : paint,
  );
}

/**
 * Its fills and strokes mirrored in its box on `axis`, for a node whose shape is mirrored that
 * way (an image keeps its look, as in Figma). Empty when it has no gradient.
 */
export function flipPaints(node: DesignNode, axis: FlipAxis): Partial<DesignNode> {
  const has = (paints: readonly Paint[]) => paints.some(isGradientPaint);
  return {
    ...(has(node.fills) ? { fills: flipped(node.fills, axis) } : {}),
    ...(has(node.strokes) ? { strokes: flipped(node.strokes, axis) } : {}),
  };
}
