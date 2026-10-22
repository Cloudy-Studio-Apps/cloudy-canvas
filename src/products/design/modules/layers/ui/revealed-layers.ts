import type { LayerTree } from "@design";

/** The ancestors of the selected layers, which open so the selection shows in the tree. */
export function revealedLayers(tree: LayerTree, selected: readonly string[]): Set<string> {
  const parentOf = new Map<string, string>();
  for (const [parent, children] of tree) {
    if (parent) for (const child of children) parentOf.set(child.id, parent);
  }
  const revealed = new Set<string>();
  for (const id of selected) {
    for (
      let parent = parentOf.get(id);
      parent && !revealed.has(parent);
      parent = parentOf.get(parent)
    ) {
      revealed.add(parent);
    }
  }
  return revealed;
}
