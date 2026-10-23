import type { CanvasDocument, CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import { DesignNodeKind, isDesignNode, type DesignNode } from "../node";
import { containerAt } from "./container-at";
import { placeLayers } from "./move/move-layers";
import { treeOrderKeys } from "./order-keys";
import { withDescendants } from "./tree-members";

/**
 * After a drag (`onMoved`): each moved node whose parent didn't move with it goes into the
 * container now under its center (or to the top of the page), on top of its new siblings. Nodes
 * in a group stay in it.
 */
export function reparentMoved(
  doc: CanvasDocument,
  moved: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): void {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const keys = treeOrderKeys(elements);
  const roots = [...moved]
    .map((id) => byId.get(id))
    .filter((el): el is DesignNode => !!el && isDesignNode(el))
    .filter((el) => !(el.parentId && moved.has(el.parentId)))
    .sort((a, b) => ((keys.get(a.id) ?? "") < (keys.get(b.id) ?? "") ? -1 : 1));

  // Each moved root by the parent it goes into, bottom to top.
  const into = new Map<string | null, DesignNode[]>();
  for (const el of roots) {
    // Children of a node that isn't a container (a group) stay in it; the group follows them.
    const parent = el.parentId ? byId.get(el.parentId) : undefined;
    const parentKind = parent && kinds.kindOf(parent);
    if (parentKind instanceof DesignNodeKind && !parentKind.container) continue;
    const exclude = withDescendants(new Set([el.id]), elements);
    const parentId = containerAt(el, elements, kinds, exclude)?.id ?? null;
    if (parentId === el.parentId) continue;
    into.set(parentId, [...(into.get(parentId) ?? []), el]);
  }
  if (into.size === 0) return;

  // On top of their new siblings.
  const patches = new Map<string, ElementPatch>();
  for (const [parentId, nodes] of into) {
    for (const [id, patch] of placeLayers(elements, nodes, { parentId, position: 0 })) {
      patches.set(id, patch);
    }
  }
  doc.updateMany(patches);
}
