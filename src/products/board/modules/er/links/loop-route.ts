import type { Point } from "@canvas";

import type { ErElement } from "../base/er.types";
import { shapeCenter } from "../base/er-outline";

/** How far a loop runs beside the diamond. */
const LOOP_OFFSET = 18;

/**
 * The n-th line of a relation to an entity that takes part more than once: an orthogonal loop
 * leaving a side corner of the diamond (n = 0 one side, n = 1 the other, further lines further out)
 * and reaching the entity on the edge that faces the diamond, a quarter of the way in from its
 * corner, so it doesn't run into the entity's other lines.
 */
export function loopPoints(relation: ErElement, entity: ErElement, n: number): Point[] {
  const d = shapeCenter(relation);
  const e = shapeCenter(entity);
  const horizontal = Math.abs(d.x - e.x) >= Math.abs(d.y - e.y);
  const toward = (horizontal ? d.x - e.x : d.y - e.y) >= 0 ? 1 : -1;
  const side = n % 2 === 0 ? -1 : 1;
  const ring = Math.floor(n / 2);
  // Half extents along (u) and across (v) the axis from the entity to the diamond.
  const du = (horizontal ? relation.w : relation.h) / 2;
  const dv = (horizontal ? relation.h : relation.w) / 2;
  const eu = (horizontal ? entity.w : entity.h) / 2;
  const ev = (horizontal ? entity.h : entity.w) / 2;
  const length = Math.abs(horizontal ? d.x - e.x : d.y - e.y);
  const out = dv + LOOP_OFFSET * (ring + 1);
  const attach = ev / 2;
  const at = (u: number, v: number): Point =>
    horizontal
      ? { x: e.x + toward * u, y: e.y + side * v }
      : { x: e.x + side * v, y: e.y + toward * u };
  const mid = (eu + (length - du)) / 2;
  return [at(length, dv), at(length, out), at(mid, out), at(mid, attach), at(eu, attach)];
}
