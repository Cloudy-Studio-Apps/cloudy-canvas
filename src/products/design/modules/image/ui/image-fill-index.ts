import type { CanvasElement } from "@canvas";
import type { DesignNode } from "@design";

/** The position of a layer's topmost visible image fill, or `null` without one. */
export function imageFillIndex(node: DesignNode): number | null {
  for (let i = node.fills.length - 1; i >= 0; i--) {
    const paint = node.fills[i];
    if (paint?.type === "image" && paint.visible) return i;
  }
  return null;
}

/** Whether an element is a layer with a visible image fill. */
export function isImageLayer(el: CanvasElement): boolean {
  const fills = (el as Partial<DesignNode>).fills;
  return Array.isArray(fills) && imageFillIndex(el as DesignNode) !== null;
}
