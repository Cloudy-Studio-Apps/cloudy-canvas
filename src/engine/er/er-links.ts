import {
  isErShape,
  type ErIsaShape,
  type ErRelationShape,
  type ErShape,
  type Shape,
} from "../document";
import type { Point } from "../geometry.types";
import type { ErLink } from "./er-links.types";
import { outlinePoint, shapeCenter } from "./er-outline";
import { loopPoints } from "./loop-route";

/** Where the cardinality label sits: this far along the line from the entity, and off to its side. */
const LABEL_ALONG = 22;
const LABEL_ACROSS = 12;

/**
 * Every line of the ER diagram: relation ↔ entity (with cardinality), attribute ↔ owner and
 * hierarchy ↔ parent / children. Expects aggregations already resolved (their bounds current).
 */
export function resolveErLinks(shapes: readonly Shape[]): ErLink[] {
  const byId = new Map<string, ErShape>();
  for (const shape of shapes) if (isErShape(shape)) byId.set(shape.id, shape);
  const links: ErLink[] = [];
  for (const shape of byId.values()) {
    if (shape.type === "er-relation") links.push(...participantLinks(shape, byId));
    else if (shape.type === "er-isa") links.push(...isaLinks(shape, byId));
    else if (shape.type === "er-attribute") {
      const owner = byId.get(shape.ownerId);
      if (owner) links.push(straightLink(shape, owner, "", false));
    }
  }
  return links;
}

function participantLinks(relation: ErRelationShape, byId: ReadonlyMap<string, ErShape>): ErLink[] {
  const counts = new Map<string, number>();
  for (const p of relation.participants) counts.set(p.entityId, (counts.get(p.entityId) ?? 0) + 1);
  const seen = new Map<string, number>();
  return relation.participants.flatMap((participant) => {
    const entity = byId.get(participant.entityId);
    if (!entity) return [];
    const label = cardinalityLabel(participant.min, participant.max);
    const n = seen.get(entity.id) ?? 0;
    seen.set(entity.id, n + 1);
    // An entity related to itself gets loops that leave from different sides.
    if ((counts.get(entity.id) ?? 1) > 1) {
      const points = loopPoints(relation, entity, n);
      return [polyLink(relation.id, entity.id, points, label, participant.arrow)];
    }
    return [straightLink(relation, entity, label, participant.arrow)];
  });
}

function isaLinks(isa: ErIsaShape, byId: ReadonlyMap<string, ErShape>): ErLink[] {
  const links: ErLink[] = [];
  const parent = byId.get(isa.parentId);
  if (parent) {
    const top = { x: isa.x + isa.w / 2, y: isa.y };
    const end = outlinePoint(parent, top);
    links.push({
      ...polyLink(
        isa.id,
        parent.id,
        [top, end],
        cardinalityLabel(isa.parentMin, isa.parentMax),
        false,
      ),
      totalMark: isa.total,
    });
  }
  for (const child of isa.children) {
    const entity = byId.get(child.entityId);
    if (entity)
      links.push(straightLink(isa, entity, cardinalityLabel(child.min, child.max), false));
  }
  return links;
}

function straightLink(from: ErShape, to: ErShape, label: string, arrow: boolean): ErLink {
  const start = outlinePoint(from, shapeCenter(to));
  const end = outlinePoint(to, shapeCenter(from));
  return polyLink(from.id, to.id, [start, end], label, arrow);
}

function polyLink(
  fromId: string,
  toId: string,
  points: Point[],
  label: string,
  arrow: boolean,
): ErLink {
  const end = points[points.length - 1]!;
  const before = points[points.length - 2] ?? end;
  return {
    fromId,
    toId,
    points,
    label,
    labelAt: label ? labelPoint(before, end) : null,
    arrow,
    totalMark: false,
  };
}

function cardinalityLabel(min: string, max: string): string {
  return min || max ? `(${min || "0"},${max || "n"})` : "";
}

/** Beside the last segment near its end, on the side above (or left of) the line. */
function labelPoint(before: Point, end: Point): Point {
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1;
  const ux = (end.x - before.x) / len;
  const uy = (end.y - before.y) / len;
  let nx = -uy;
  let ny = ux;
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  const along = Math.min(LABEL_ALONG, len / 2);
  return {
    x: end.x - ux * along + nx * LABEL_ACROSS,
    y: end.y - uy * along + ny * LABEL_ACROSS,
  };
}
