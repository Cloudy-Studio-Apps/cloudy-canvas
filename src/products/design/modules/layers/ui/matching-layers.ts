import type { DesignNode, LayerTree } from "@design";

/** Every layer whose name contains `query` (ignoring case), topmost first. */
export function matchingLayers(tree: LayerTree, query: string): DesignNode[] {
  const needle = query.trim().toLowerCase();
  const found: DesignNode[] = [];
  const visit = (parent: string | null) => {
    for (const node of tree.get(parent) ?? []) {
      if (node.name.toLowerCase().includes(needle)) found.push(node);
      visit(node.id);
    }
  };
  visit(null);
  return found;
}
