import type { CanvasDocument, EditedChange } from "@canvas";

/** The top-level layer `id` is in (itself at the top), read by field. */
function topOf(doc: CanvasDocument, id: string, parentId: unknown): string {
  let top = id;
  const seen = new Set<string>([id]);
  for (let p = parentId; typeof p === "string" && !seen.has(p); p = doc.field(p, "parentId")) {
    seen.add(p);
    top = p;
  }
  return top;
}

/** The top-level layers an edit changed something in: what was added, changed, moved or removed. */
export function touchedTops(doc: CanvasDocument, change: EditedChange): Set<string> {
  const tops = new Set<string>();
  for (const id of change.updated) {
    tops.add(topOf(doc, id, doc.field(id, "parentId")));
    const before = change.before.get(id);
    if (before && "parentId" in before) tops.add(topOf(doc, id, before.parentId));
  }
  for (const el of change.removed) {
    tops.add(topOf(doc, el.id, (el as { parentId?: unknown }).parentId));
  }
  return tops;
}
