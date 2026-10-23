import type { DesignNode, LayerTree } from "@design";

import type { LayerRowItem } from "./visible-rows.types";

/**
 * The layers list as flat rows, topmost first: `roots` and, under each expanded layer, its
 * children, a level deeper. With `flat` (search results) no layer shows its children.
 */
export function visibleRows(
  roots: readonly DesignNode[],
  tree: LayerTree,
  expanded: ReadonlySet<string>,
  flat = false,
): LayerRowItem[] {
  const rows: LayerRowItem[] = [];
  const visit = (nodes: readonly DesignNode[], depth: number, parentId: string | null) => {
    nodes.forEach((node, i) => {
      const children = flat ? [] : (tree.get(node.id) ?? []);
      const open = children.length > 0 && expanded.has(node.id);
      rows.push({
        node,
        depth,
        parentId,
        hasChildren: children.length > 0,
        expanded: open,
        last: i === nodes.length - 1,
      });
      if (open) visit(children, depth + 1, node.id);
    });
  };
  visit(roots, 0, null);
  return rows;
}
