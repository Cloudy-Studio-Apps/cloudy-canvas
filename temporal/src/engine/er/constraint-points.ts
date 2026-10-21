import type { ErConstraintShape, ErShape } from "../document";
import type { Point } from "../geometry.types";
import { outlinePoint, shapeCenter } from "./er-outline";

/** How far outside the entity the arc of an exclusive / inclusive constraint runs. */
const ARC_GAP = 22;
/** The arc reaches a little past the two lines it crosses. */
const ARC_OVERSHOOT = (12 * Math.PI) / 180;
const ARC_STEPS = 18;

/**
 * World points of a constraint's drawing. Exclusion and inclusion run from one diamond to the
 * other; exclusive and inclusive are an arc round the entity crossing its lines to both relations,
 * from the `from` relation's side to the `to` relation's side.
 */
export function constraintPoints(
  constraint: ErConstraintShape,
  get: (id: string) => ErShape | undefined,
): Point[] {
  const from = get(constraint.fromId);
  const to = get(constraint.toId);
  if (!from || !to) return [];
  if (constraint.rule === "exclusion" || constraint.rule === "inclusion") {
    return [outlinePoint(from, shapeCenter(to)), outlinePoint(to, shapeCenter(from))];
  }
  const entity = get(constraint.entityId);
  if (!entity) return [];
  const c = shapeCenter(entity);
  const a = Math.atan2(shapeCenter(from).y - c.y, shapeCenter(from).x - c.x);
  let b = Math.atan2(shapeCenter(to).y - c.y, shapeCenter(to).x - c.x);
  // The short way round.
  while (b - a > Math.PI) b -= 2 * Math.PI;
  while (a - b > Math.PI) b += 2 * Math.PI;
  const dir = b >= a ? 1 : -1;
  const start = a - dir * ARC_OVERSHOOT;
  const end = b + dir * ARC_OVERSHOOT;
  const radius = Math.hypot(entity.w / 2, entity.h / 2) + ARC_GAP;
  return Array.from({ length: ARC_STEPS + 1 }, (_, i) => {
    const t = start + ((end - start) * i) / ARC_STEPS;
    return { x: c.x + Math.cos(t) * radius, y: c.y + Math.sin(t) * radius };
  });
}
