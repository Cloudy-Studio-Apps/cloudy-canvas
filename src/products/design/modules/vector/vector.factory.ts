import {
  createNodeBase,
  placeNetwork,
  polylineNetwork,
  solidPaint,
  type Paint,
  type VectorNetwork,
} from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import type { VectorElement } from "./vector.types";

/**
 * A vector drawing `network` (its coordinates in world units: the node is placed around it), with
 * the default black stroke unless `paints` are given.
 */
export function createVector(
  network: VectorNetwork,
  name: string,
  index: string,
  parentId: string | null,
  paints: { fills?: Paint[]; strokes?: Paint[]; strokeWeight?: number } = {},
): VectorElement {
  const { network: placed, ...rect } = placeNetwork({ x: 0, y: 0 }, network);
  return {
    ...createNodeBase("vector", rect, index, { name, parentId, fills: paints.fills ?? [] }),
    strokes: paints.strokes ?? [solidPaint(VECTOR_DEFAULTS.stroke)],
    strokeWeight: paints.strokeWeight ?? VECTOR_DEFAULTS.strokeWeight,
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
