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
  look: VectorLook = {},
): VectorElement {
  const { network: placed, ...rect } = placeNetwork({ x: 0, y: 0 }, network);
  // Only the look's fields: callers pass whole nodes, whose type, id and place aren't the vector's.
  const { fills = [], strokes, strokeWeight } = look;
  return {
    ...createNodeBase("vector", rect, index, { name, parentId, fills }),
    strokes: strokes ?? [solidPaint(VECTOR_DEFAULTS.stroke)],
    strokeWeight: strokeWeight ?? VECTOR_DEFAULTS.strokeWeight,
    strokeAlign: look.strokeAlign ?? "center",
    strokeCap: look.strokeCap ?? VECTOR_DEFAULTS.strokeCap,
    strokeJoin: look.strokeJoin ?? VECTOR_DEFAULTS.strokeJoin,
    ...(look.strokeMiterAngle !== undefined ? { strokeMiterAngle: look.strokeMiterAngle } : {}),
    ...(look.strokeDashes !== undefined ? { strokeDashes: look.strokeDashes } : {}),
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
