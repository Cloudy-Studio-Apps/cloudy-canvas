import type { CanvasDocument, EditedChange, ElementPatch } from "@canvas";

import { childrenMap, dataCopyTag, freedPatch, repeatOf, walkDescendants } from "../repeat";

/**
 * The child of `ancestor` that `id` sits in (`id` itself when it's a child), `null` when it isn't
 * inside `ancestor` at all.
 */
function childOnTheWay(doc: CanvasDocument, id: string, ancestor: string): string | null {
  const seen = new Set<string>();
  let below = id;
  for (let p = doc.field(id, "parentId"); typeof p === "string" && !seen.has(p);) {
    if (p === ancestor) return below;
    seen.add(p);
    below = p;
    p = doc.field(p, "parentId");
  }
  return null;
}

/**
 * Whether a copy of `iterator` belongs nowhere: the frame is gone or stopped repeating, or the
 * copy is no longer inside one of the frame's copies.
 */
function orphaned(doc: CanvasDocument, id: string, iterator: string): boolean {
  const frame = doc.get(iterator);
  if (!frame) return true;
  // A frame that no longer repeats (a peer removed it as this copy was made); a copied iterator
  // whose template's repeat went is its own sync's, which removes its copies.
  if (!repeatOf(frame) && !dataCopyTag(frame)) return true;
  // Out of the frame, or into the template or another plain layer of it (dragged there).
  const top = childOnTheWay(doc, id, iterator);
  const holder = top ? doc.get(top) : undefined;
  return !holder || dataCopyTag(holder)?.iterator !== iterator;
}

/**
 * Frees the copies that lost their iterator (`freedPatch`: untagged, unlocked, no data fields; they
 * keep what they show, as a user's layer): a tagged layer the edit touched that is no longer in
 * one of its iterator's copies (dragged out of the frame, or into its template or another plain
 * layer of it), or whose iterator frame no longer repeats (a peer removed the repeat as the copy
 * was made), and, when the edit removed an iterator, any tagged layer whose iterator frame no
 * longer exists (a peer's delete, an undo). The layers a freed copy holds go with it. Only the touched layers are checked, so an edit that touches no copy costs
 * nothing.
 */
export function sweepOrphans(doc: CanvasDocument, change: EditedChange): void {
  const roots = new Set<string>();
  for (const id of change.updated) {
    const el = doc.get(id);
    const tag = el ? dataCopyTag(el) : null;
    if (!tag) continue;
    if (orphaned(doc, id, tag.iterator)) roots.add(id);
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
