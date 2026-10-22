import type { CanvasDocument, CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import { isDesignNode } from "../node";
import { containerAt } from "./container-at";
import { withDescendants } from "./tree-members";

/**
 * After a drag (`onMoved`): each moved node whose parent didn't move with it goes into the
 * container now under its center (or to the top of the page), on top of its new siblings.
 */
export function reparentMoved(
  doc: CanvasDocument,
  moved: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): void {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const patches = new Map<string, ElementPatch>();
  const roots = [...moved]
    .map((id) => byId.get(id))
    .filter((el) => el && isDesignNode(el) && !(el.parentId && moved.has(el.parentId)));

  for (const el of roots) {
    if (!el || !isDesignNode(el)) continue;
    const exclude = withDescendants(new Set([el.id]), elements);
    const parentId = containerAt(kinds.kindOf(el).bounds(el), elements, kinds, exclude)?.id ?? null;
    if (parentId === el.parentId) continue;
    patches.set(el.id, { parentId } as ElementPatch);
  }
  if (patches.size === 0) return;

  const indexes = doc.nextIndexes(patches.size);
  [...patches.values()].forEach((patch, i) => (patch.index = indexes[i]));
  doc.updateMany(patches);
}
