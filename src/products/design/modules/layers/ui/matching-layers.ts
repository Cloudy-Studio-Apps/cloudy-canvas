import type { ElementKinds } from "@canvas";
import { layerNameOf, type DesignNode, type LayerTree } from "../../core";

/** Every layer whose name contains `query` (ignoring case), topmost first. */
export function matchingLayers(tree: LayerTree, query: string, kinds: ElementKinds): DesignNode[] {
  const needle = query.trim().toLowerCase();
  const found: DesignNode[] = [];
  const visit = (parent: string | null) => {
    for (const node of tree.get(parent) ?? []) {
      if (layerNameOf(node, kinds).toLowerCase().includes(needle)) found.push(node);
      visit(node.id);
    }
  };
  visit(null);
  return found;
}
