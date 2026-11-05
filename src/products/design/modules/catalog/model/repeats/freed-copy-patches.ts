import type { CanvasDocument, ElementPatch } from "@canvas";

import { childrenByParent } from "../../../core";
import { freedPatch } from "../../../data";
import { repeatCopyTag } from "./repeat-copy-tag";

/**
 * What frees the pages of copies taken out of a brochure's repeats (`frames`, those still in the
 * document): each layer in them its repeats made (`repeatCopy` naming `brochure`) is untagged,
 * unlocked and loses its data fields (data's `freedPatch`), so it keeps what it shows; a detached
 * page has no row to read. The master copies stamped on them are left to the page items' sync.
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
    queue.push(...(children.get(next) ?? []));
    const el = doc.get(next);
    if (!el || repeatCopyTag(el)?.brochure !== brochure) continue;
    patches.set(next, { ...freedPatch(el), repeatCopy: null } as ElementPatch);
  }
  return patches;
}
