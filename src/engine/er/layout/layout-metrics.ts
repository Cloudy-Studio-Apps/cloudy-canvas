import type { ErShapes } from "../lang";
import type { LayoutMetrics } from "./layout.types";

/** Shortest line between an entity and a relation diamond. */
export const LINK_LENGTH = 64;
/** Gap between an owner and its attribute ellipses. */
export const RING_GAP = 32;

/** Grid spacing: room for a diamond between neighbours, and for attributes around each entity. */
export function layoutMetrics({ entities, relations, attributes }: ErShapes): LayoutMetrics {
  const max = (values: number[]) => Math.max(0, ...values);
  const entityW = max(entities.map((e) => e.w));
  const entityH = max(entities.map((e) => e.h));
  const relationW = max(relations.map((r) => r.w));
  const relationH = max(relations.map((r) => r.h));
  const ringX = attributes.length ? RING_GAP + max(attributes.map((a) => a.w)) : 0;
  const ringY = attributes.length ? RING_GAP + max(attributes.map((a) => a.h)) * 1.5 : 0;
  return {
    pitchX: Math.max(entityW + relationW + LINK_LENGTH * 2, entityW + ringX * 1.5),
    pitchY: Math.max(entityH + relationH + LINK_LENGTH * 2, entityH + ringY * 2),
    ringX,
    ringY,
  };
}
