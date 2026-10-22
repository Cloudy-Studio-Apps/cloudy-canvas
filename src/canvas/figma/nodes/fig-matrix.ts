import type { Point, Rect } from "../../geometry.types";

import type { FigMatrix } from "./fig-node.types";

export const IDENTITY: FigMatrix = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 };

const EPSILON = 1e-6;

/** `a` then `b` applied inside it: a parent's world transform times a child's local one. */
export function multiply(a: FigMatrix, b: FigMatrix): FigMatrix {
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10,
    m01: a.m00 * b.m01 + a.m01 * b.m11,
    m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02,
    m10: a.m10 * b.m00 + a.m11 * b.m10,
    m11: a.m10 * b.m01 + a.m11 * b.m11,
    m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12,
  };
}

export function applyMatrix(m: FigMatrix, p: Point): Point {
  return { x: m.m00 * p.x + m.m01 * p.y + m.m02, y: m.m10 * p.x + m.m11 * p.y + m.m12 };
}

/** A direction (a bezier tangent) through the matrix, without its translation. */
export function applyLinear(m: FigMatrix, p: Point): Point {
  return { x: m.m00 * p.x + m.m01 * p.y, y: m.m10 * p.x + m.m11 * p.y };
}

/** Whether the matrix only moves and scales up (no rotation, skew or flip). */
export function isAxisAligned(m: FigMatrix): boolean {
  return Math.abs(m.m01) < EPSILON && Math.abs(m.m10) < EPSILON && m.m00 > 0 && m.m11 > 0;
}

/** The world box around a `w`×`h` node placed by `m`. */
export function boxOf(m: FigMatrix, w: number, h: number): Rect {
  const corners = [
    applyMatrix(m, { x: 0, y: 0 }),
    applyMatrix(m, { x: w, y: 0 }),
    applyMatrix(m, { x: 0, y: h }),
    applyMatrix(m, { x: w, y: h }),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
