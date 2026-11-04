import type { CanvasDocument, ElementPatch } from "@canvas";

import { isDesignNode, withDescendants } from "../../../core";
import { brochuresOf } from "../design-brochures";
import { pageItemTag } from "./page-item-fields";

/** The page frame (top-level layer) a layer is in. */
function topFrameOf(doc: CanvasDocument, id: string): string {
  let top = id;
  for (let depth = 0; depth < 64; depth++) {
    const el = doc.get(top);
    if (!el || !isDesignNode(el) || !el.parentId) break;
    top = el.parentId;
  }
  return top;
}

/**
 * Detaches master layers' copies (`ids`, with the copies they hold) from their master, in one
 * undo step: each becomes an ordinary layer of its page (unlocked, untagged; a page item keeps its
 * template, so its number still reads), and its page no longer gets that master layer. Returns
 * how many were detached.
 */
export function detachCopies(doc: CanvasDocument, ids: Iterable<string>): number {
  const all = withDescendants(new Set(ids), doc.all());
  const patches = new Map<string, ElementPatch>();
  // Per brochure and page, the master layers no longer stamped there.
  const skips = new Map<string, { brochure: string; frame: string; sources: string[] }>();
  for (const id of all) {
    const tag = pageItemTag(doc.get(id));
    if (!tag) continue;
    patches.set(id, { catalogCopy: null, locked: false } as ElementPatch);
    const frame = topFrameOf(doc, id);
    const key = `${tag.brochure}|${frame}`;
    const entry = skips.get(key) ?? { brochure: tag.brochure, frame, sources: [] };
    entry.sources.push(tag.source);
    skips.set(key, entry);
  }
  if (patches.size === 0) return 0;
  doc.checkpoint();
  doc.batch(() => {
    doc.updateMany(patches);
    for (const { brochure, frame, sources } of skips.values()) {
      const handle = brochuresOf(doc).get(brochure);
      const slot = handle?.pageOf(frame)?.slot.id;
      if (handle && slot) handle.masters.skip(slot, sources);
    }
  });
  return patches.size;
}
