import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../node";

/** `base` numbered one past the highest "base N" layer, e.g. "Frame 3". */
export function nextLayerName(elements: readonly CanvasElement[], base: string): string {
  const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} (\\d+)$`);
  let highest = 0;
  for (const el of elements) {
    const match = isDesignNode(el) ? pattern.exec(el.name) : null;
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `${base} ${highest + 1}`;
}
