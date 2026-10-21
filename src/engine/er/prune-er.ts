import { isErShape, type BoardDocument } from "../document";

/**
 * Removes attributes whose owner is gone (with their parts) and drops participants whose entity
 * is gone. Call inside a batch, after removing shapes.
 */
export function pruneEr(doc: BoardDocument): void {
  const shapes = doc.all().filter(isErShape);
  const alive = new Set(shapes.map((s) => s.id));
  const orphans = new Set<string>();
  let found = true;
  while (found) {
    found = false;
    for (const shape of shapes) {
      if (shape.type !== "er-attribute" || orphans.has(shape.id)) continue;
      if (!alive.has(shape.ownerId) || orphans.has(shape.ownerId)) {
        orphans.add(shape.id);
        found = true;
      }
    }
  }
  if (orphans.size) doc.remove(orphans);

  for (const shape of shapes) {
    if (shape.type !== "er-relation") continue;
    const participants = shape.participants.filter((p) => alive.has(p.entityId));
    if (participants.length !== shape.participants.length) doc.update(shape.id, { participants });
  }
}
