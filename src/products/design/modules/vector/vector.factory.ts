import {
  createNodeBase,
  placeNetwork,
  polylineNetwork,
  solidPaint,
  type VectorNetwork,
} from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import type { VectorElement, VectorLook } from "./vector.types";

/**
 * A vector drawing `network` (its coordinates in world units: the node is placed around it), with
 * the default black stroke unless `look` gives its paints (and centered, round strokes unless it
 * gives its stroke's settings).
 */
export function createVector(
  network: VectorNetwork,
  name: string,
  index: string,
  parentId: string | null,
  { fills = [], strokes, strokeWeight, ...stroke }: VectorLook = {},
): VectorElement {
  const { network: placed, ...rect } = placeNetwork({ x: 0, y: 0 }, network);
  return {
    ...createNodeBase("vector", rect, index, { name, parentId, fills }),
    strokes: strokes ?? [solidPaint(VECTOR_DEFAULTS.stroke)],
    strokeWeight: strokeWeight ?? VECTOR_DEFAULTS.strokeWeight,
    strokeAlign: "center",
    strokeCap: VECTOR_DEFAULTS.strokeCap,
    strokeJoin: VECTOR_DEFAULTS.strokeJoin,
    ...stroke,
    network: placed,
  };
}

/** A vector through a flat list of world points (a pencil line). */
export function createVectorLine(
  points: readonly number[],
  name: string,
  index: string,
  parentId: string | null,
): VectorElement {
  return createVector(polylineNetwork(points), name, index, parentId);
}
