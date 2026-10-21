import { isErShape, type ErRelationShape, type ErShape, type Shape } from "../document";
import type { Point } from "../geometry.types";
import type { ErLink } from "./er-links.types";
import { outlinePoint, shapeCenter } from "./er-outline";

/** Sideways distance between the two lines of a unary relation. */
const PARALLEL_OFFSET = 10;
/** Where the cardinality label sits: this far along the line from the entity, and off to its side. */
const LABEL_ALONG = 22;
const LABEL_ACROSS = 12;

/** Every line of the ER diagram: relation ↔ entity (with cardinality) and attribute ↔ owner. */
export function resolveErLinks(shapes: readonly Shape[]): ErLink[] {
  const byId = new Map<string, ErShape>();
  for (const shape of shapes) if (isErShape(shape)) byId.set(shape.id, shape);
  const links: ErLink[] = [];
  for (const shape of byId.values()) {
    if (shape.type === "er-relation") links.push(...participantLinks(shape, byId));
    if (shape.type === "er-attribute") {
      const owner = byId.get(shape.ownerId);
      if (owner) links.push(straightLink(shape, owner, 0, ""));
    }
  }
  return links;
}

function participantLinks(relation: ErRelationShape, byId: ReadonlyMap<string, ErShape>): ErLink[] {
  const seen = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const p of relation.participants) counts.set(p.entityId, (counts.get(p.entityId) ?? 0) + 1);
  return relation.participants.flatMap((participant) => {
    const entity = byId.get(participant.entityId);
    if (!entity) return [];
    // Several lines to the same entity (unary relations) are spread sideways.
    const n = seen.get(entity.id) ?? 0;
    seen.set(entity.id, n + 1);
    const total = counts.get(entity.id) ?? 1;
    const offset = (n - (total - 1) / 2) * PARALLEL_OFFSET * 2;
    const label =
      participant.min || participant.max
        ? `(${participant.min || "0"},${participant.max || "n"})`
        : "";
    return [straightLink(relation, entity, offset, label)];
  });
}

function straightLink(from: ErShape, to: ErShape, offset: number, label: string): ErLink {
  const a = shapeCenter(from);
  const b = shapeCenter(to);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const shift = { x: -uy * offset, y: ux * offset };
  const start = outlinePoint(from, { x: b.x + shift.x, y: b.y + shift.y });
  const end = outlinePoint(to, { x: a.x + shift.x, y: a.y + shift.y });
  const fromPoint = { x: start.x + shift.x, y: start.y + shift.y };
  const toPoint = { x: end.x + shift.x, y: end.y + shift.y };
  return {
    fromId: from.id,
    toId: to.id,
    from: fromPoint,
    to: toPoint,
    label,
    labelAt: label ? labelPoint(toPoint, ux, uy) : null,
  };
}

/** Beside the line near the entity end, on the side above (or left of) the line. */
function labelPoint(end: Point, ux: number, uy: number): Point {
  let nx = -uy;
  let ny = ux;
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  return {
    x: end.x - ux * LABEL_ALONG + nx * LABEL_ACROSS,
    y: end.y - uy * LABEL_ALONG + ny * LABEL_ACROSS,
  };
}
