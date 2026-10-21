import type { CanvasDocument } from "@canvas";

import { isErElement } from "../base/is-er-element";
import type { ErElement } from "../base/er.types";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErRelationElement } from "../relation/relation.types";
import { patchEr } from "./patch-er-element";

/**
 * Cleans up after shapes were removed: attributes whose owner is gone (with their parts),
 * hierarchies whose parent is gone, aggregations whose relation is gone and constraints whose
 * relations or entity are gone are removed; participants and hierarchy children that point at
 * removed shapes are dropped. Call inside a batch, after removing shapes.
 */
export function pruneEr(doc: CanvasDocument): void {
  const shapes = doc.all().filter(isErElement);
  const alive = new Set(shapes.map((s) => s.id));
  const gone = new Set<string>();
  const dead = (id: string) => !alive.has(id) || gone.has(id);
  let found = true;
  while (found) {
    found = false;
    for (const shape of shapes) {
      if (gone.has(shape.id) || !isOrphan(shape, dead)) continue;
      gone.add(shape.id);
      found = true;
    }
  }
  if (gone.size) doc.remove(gone);

  for (const shape of shapes) {
    if (gone.has(shape.id)) continue;
    if (shape.type === "er-relation") {
      const participants = shape.participants.filter((p) => !dead(p.entityId));
      if (participants.length !== shape.participants.length) {
        patchEr<ErRelationElement>(doc, shape.id, { participants });
      }
    } else if (shape.type === "er-isa") {
      const children = shape.children.filter((c) => !dead(c.entityId));
      if (children.length !== shape.children.length) {
        patchEr<ErIsaElement>(doc, shape.id, { children });
      }
    }
  }
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
