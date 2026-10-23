import { LruCache, type PathShape, type StrokeAreaOptions } from "@canvas";

import type { DesignNode, StrokeCap, StrokeShape } from "./design-node.types";

/**
 * Stroke areas and dashed paths by kind, shape and stroke key (see `DesignNodeKind.strokeArea`),
 * shared by every design open, so drawing and hit tests don't outline a stroke twice.
 */
export const STROKE_CACHE = new LruCache<string, PathShape>(1024);

/** Figma's stroke caps as Clipper's and Pixi's. */
const CAPS = { none: "butt", round: "round", square: "square" } as const satisfies Record<
  StrokeCap,
  StrokeShape["cap"]
>;

/** Whether a node shows a stroke: some weight and a visible stroke paint. */
export function hasVisibleStroke(node: DesignNode): boolean {
  return node.strokeWeight > 0 && node.strokes.some((paint) => paint.visible);
}

/** What a node's stroke area depends on besides its shape, as a string. */
export function strokeKey(node: DesignNode): string {
  const sides = node.strokeWeights;
  return [
    node.strokeWeight,
    node.strokeAlign,
    node.strokeCap,
    node.strokeJoin,
    node.strokeMiterAngle,
    node.strokeDashes.join(" "),
    sides ? `${sides.top} ${sides.right} ${sides.bottom} ${sides.left}` : "",
  ].join("|");
}

/**
 * A miter angle (degrees) as a miter limit: the longest miter, in stroke widths, before a corner
 * is beveled (SVG's, Pixi's and Clipper's ratio).
 */
export function miterLimit(angle: number): number {
  const half = (Math.min(Math.max(angle, 1), 179) * Math.PI) / 360;
  return 1 / Math.sin(half);
}

/** How Pixi strokes a node's path: its cap, join and miter limit. */
export function strokeShapeOf(node: DesignNode): StrokeShape {
  return {
    cap: CAPS[node.strokeCap],
    join: node.strokeJoin,
    miterLimit: miterLimit(node.strokeMiterAngle),
  };
}

/** How a node's stroke becomes an area (`strokeArea`). */
export function strokeAreaOptions(node: DesignNode): StrokeAreaOptions {
  return {
    width: node.strokeWeight,
    align: node.strokeAlign,
    ...strokeShapeOf(node),
    dashes: node.strokeDashes,
  };
}

/** How far a node's stroke can reach past its outline (miters included), for quick rejects. */
export function strokeReach(node: DesignNode): number {
  const width = node.strokeAlign === "outside" ? node.strokeWeight : node.strokeWeight / 2;
  const corner = node.strokeJoin === "miter" ? miterLimit(node.strokeMiterAngle) : 1;
  const cap = node.strokeCap === "square" ? Math.SQRT2 : 1;
  return width * Math.max(corner, cap);
}
