import type { CanvasDocument, EditedChange, ElementPatch } from "@canvas";

import { childrenMap, dataCopyTag, freedPatch, repeatOf, walkDescendants } from "../repeat";

/** Whether `id` sits inside `ancestor` (any depth). */
function isInside(doc: CanvasDocument, id: string, ancestor: string): boolean {
  const seen = new Set<string>();
  for (let p = doc.field(id, "parentId"); typeof p === "string" && !seen.has(p);) {
    if (p === ancestor) return true;
    seen.add(p);
    p = doc.field(p, "parentId");
  }
  return false;
}

/**
 * Frees the copies that lost their iterator (`freedPatch`: untagged, unlocked, no data fields; they
 * keep what they show, as a user's layer): a tagged layer the edit touched that is no longer inside
 * its iterator frame (dragged out, reparented), and, when the edit removed an iterator, any tagged
 * layer whose iterator frame no longer exists (a peer's delete, an undo). The layers a freed copy
 * holds go with it. Only the touched layers are checked, so an edit that touches no copy costs
 * nothing.
 */
export function sweepOrphans(doc: CanvasDocument, change: EditedChange): void {
  const roots = new Set<string>();
  for (const id of change.updated) {
    const el = doc.get(id);
    const tag = el ? dataCopyTag(el) : null;
    if (!tag) continue;
    if (!doc.get(tag.iterator) || !isInside(doc, id, tag.iterator)) roots.add(id);
  }
  if (change.removed.some((el) => repeatOf(el))) {
    for (const el of doc.all()) {
      const tag = dataCopyTag(el);
      if (tag && !doc.get(tag.iterator)) roots.add(el.id);
    }
  }
  if (roots.size === 0) return;
  // One pass over the document for the layers every freed copy holds.
  const patches = new Map<string, ElementPatch>();
  const everyone = [...roots, ...walkDescendants(childrenMap(doc), roots).map((el) => el.id)];
  for (const id of everyone) {
    const el = doc.get(id);
    const patch = el ? freedPatch(el) : null;
    if (patch) patches.set(id, patch);
  }
  if (patches.size > 0) doc.updateMany(patches);
}
