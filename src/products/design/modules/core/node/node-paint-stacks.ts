import { networkOf } from "../network/region-paints";
import type { DesignNode } from "./design-node.types";
import type { NodePaintStack } from "./node-paint-stacks.types";

/**
 * Every paint stack a node shows: its fills, its strokes and, for a vector, its areas' own fills
 * (at `network.regions.<i>.fills`), so what lists or binds a page's colors finds them all.
 */
export function nodePaintStacks(node: DesignNode): NodePaintStack[] {
  const stacks: NodePaintStack[] = [
    { path: "fills", paints: node.fills },
    { path: "strokes", paints: node.strokes },
  ];
  networkOf(node)?.regions.forEach((region, i) => {
    if (region.fills) stacks.push({ path: `network.regions.${i}.fills`, paints: region.fills });
  });
  return stacks;
}
