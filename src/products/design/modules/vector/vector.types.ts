import type { ElementDefaults } from "@canvas";

import type { DesignNode, StrokeCap, StrokeJoin, VectorNetwork } from "../core";

/**
 * A vector: a network of vertices and bezier segments (local coordinates, starting at 0, 0),
 * whose closed regions are filled and whose segments are stroked. Drawn with the pencil or the
 * pen, or converted from a shape when its points are edited.
 */
export interface VectorElement extends DesignNode {
  type: "vector";
  network: VectorNetwork;
}

/** What `createVector` takes of a new vector's look. */
export type VectorLook = Partial<
  Pick<
    DesignNode,
    | "fills"
    | "strokes"
    | "strokeWeight"
    | "strokeAlign"
    | "strokeCap"
    | "strokeJoin"
    | "strokeMiterAngle"
    | "strokeDashes"
  >
>;

export interface VectorDefaults extends ElementDefaults {
  stroke: string;
  strokeWeight: number;
  /** Pencil lines and pen paths end and turn round. */
  strokeCap: StrokeCap;
  strokeJoin: StrokeJoin;
  /** How much the pencil smooths a line, in screen pixels. */
  smoothing: number;
  /** Extra grab distance around thin lines, in world units at 100%. */
  reach: number;
}
