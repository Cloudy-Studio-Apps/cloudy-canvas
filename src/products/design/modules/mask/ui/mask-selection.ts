import type { CanvasElement } from "@canvas";
import { isDesignNode } from "@design";
import type { PropertySelection } from "@design/ui/modules";

/** Whether every selected layer is a mask (and something is selected). */
export function selectionIsMasks(
  elements: readonly CanvasElement[],
  selected: readonly string[],
): boolean {
  const ids = new Set(selected);
  const nodes = elements.filter((el) => ids.has(el.id));
  return nodes.length > 0 && nodes.every((el) => isDesignNode(el) && el.isMask);
}

/** The Mask section shows whenever layers are selected (to make or edit masks). */
export function maskSectionShown({ nodes }: PropertySelection): boolean {
  return nodes.length > 0;
}
