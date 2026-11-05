import type { CanvasDocument, ElementPatch } from "@canvas";

import { childrenByParent } from "../../../core";
import { freedPatch } from "../../../data";
import { pageItemTag } from "../page-items/page-item-fields";
import { repeatCopyTag } from "./repeat-copy-tag";

/**
 * What frees the pages of copies taken out of a brochure's repeats (`frames`, those still in the
 * document), as data's own detach frees a card: every layer in them is unlocked and loses its data
 * fields and tags (data's `freedPatch`: `dataCopy`, a card repeater's `repeat` and its cards'
 * bindings; and the `repeatCopy` of this brochure), so the page keeps what it shows and is all
 * plain layers; a detached page has no row to read. The master copies stamped on them
 * (`catalogCopy`) are left to the page items' sync.
 */
export function freedCopyPatches(
  doc: CanvasDocument,
  brochure: string,
  frames: readonly string[],
): Map<string, ElementPatch> {
  const patches = new Map<string, ElementPatch>();
  const roots = frames.filter((id) => doc.get(id));
  if (roots.length === 0) return patches;
  const children = childrenByParent(doc.all());
  const seen = new Set<string>();
  const queue = [...roots];
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (seen.has(next)) continue;
    seen.add(next);
    const el = doc.get(next);
    if (!el || pageItemTag(el)) continue;
    queue.push(...(children.get(next) ?? []));
    const patch: Record<string, unknown> = { ...freedPatch(el) };
    if (repeatCopyTag(el)?.brochure === brochure) patch.repeatCopy = null;
    if (Object.keys(patch).length > 0) patches.set(next, patch as ElementPatch);
  }
  return patches;
}
