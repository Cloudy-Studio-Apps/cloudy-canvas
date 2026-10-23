import type { ElementPatch } from "@canvas";

import { layoutOf, type AutoLayout, type DesignNode } from "../core";

/** The patch that changes some of a layout frame's settings (`null` when it has no layout). */
export function layoutPatch(
  node: DesignNode,
  change: Partial<AutoLayout>,
): ElementPatch<DesignNode> | null {
  const layout = layoutOf(node);
  return layout ? ({ layout: { ...layout, ...change } } as ElementPatch<DesignNode>) : null;
}
