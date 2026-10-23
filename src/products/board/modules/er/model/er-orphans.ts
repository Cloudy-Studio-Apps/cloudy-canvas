import type { ElementPatch } from "@canvas";

import type { ErElement } from "../base/er.types";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErRelationElement } from "../relation/relation.types";

/**
 * ER elements that can't exist without one that's `dead`: attributes whose owner is gone (with
 * their parts), hierarchies whose parent is gone, aggregations whose relation is gone and
 * constraints whose relations or entity are gone.
 */
export function erOrphans(
  shapes: readonly ErElement[],
  dead: (id: string) => boolean,
): Set<string> {
  const gone = new Set<string>();
  const isDead = (id: string) => dead(id) || gone.has(id);
  let found = true;
  while (found) {
    found = false;
    for (const shape of shapes) {
      if (gone.has(shape.id) || !isOrphan(shape, isDead)) continue;
      gone.add(shape.id);
      found = true;
    }
  }
  return gone;
}

/**
 * Drops participants and hierarchy children that point at `dead` elements (and the join attribute
 * of a participant when it's dead); `null` when none do.
 */
export function withoutDeadLinks(
  shape: ErElement,
  dead: (id: string) => boolean,
): ElementPatch<ErRelationElement> | ElementPatch<ErIsaElement> | null {
  if (shape.type === "er-relation") {
    const alive = shape.participants.filter((p) => !dead(p.entityId));
    const participants = alive.map((p) => (p.via && dead(p.via) ? { ...p, via: "" } : p));
    const changed =
      alive.length !== shape.participants.length || participants.some((p, i) => p !== alive[i]);
    return changed ? { participants } : null;
  }
  if (shape.type === "er-isa") {
    const children = shape.children.filter((c) => !dead(c.entityId));
    return children.length === shape.children.length ? null : { children };
  }
  return null;
}

function isOrphan(shape: ErElement, dead: (id: string) => boolean): boolean {
  switch (shape.type) {
    case "er-attribute":
      return dead(shape.ownerId);
    case "er-isa":
      return dead(shape.parentId);
    case "er-aggregate":
      return dead(shape.relationId);
    case "er-constraint":
      return dead(shape.fromId) || dead(shape.toId) || (!!shape.entityId && dead(shape.entityId));
    default:
      return false;
  }
}
