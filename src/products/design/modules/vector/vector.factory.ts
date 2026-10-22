import { boundsOfPoints } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import type { VectorElement } from "./vector.types";

/** A vector through these world points (a flat [x0, y0, …] list). */
export function createVector(
  points: readonly number[],
  name: string,
  index: string,
  parentId: string | null,
): VectorElement {
  const { x, y, w, h } = boundsOfPoints([...points]);
  return {
    ...createNodeBase("vector", { x, y, w, h }, index, { name, parentId }),
    strokes: [solidPaint(VECTOR_DEFAULTS.stroke)],
    strokeWeight: VECTOR_DEFAULTS.strokeWeight,
    points: points.map((value, i) => value - (i % 2 === 0 ? x : y)),
  };
}
