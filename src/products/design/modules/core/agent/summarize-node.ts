import { summarizeElement, type CanvasElement, type ElementKinds } from "@canvas";

import { isDesignNode } from "../node";
import type { NodeSummary } from "./summarize-node.types";

/**
 * A layer's summary for listings. `maskedBy` is the scene's `siblingMasks`, so the layers a mask
 * masks say which one.
 */
export function summarizeNode(
  kinds: ElementKinds,
  el: CanvasElement,
  maskedBy: ReadonlyMap<string, string> = new Map(),
): NodeSummary {
  const node = isDesignNode(el) ? el : null;
  const mask = maskedBy.get(el.id);
  return {
    ...summarizeElement(kinds, el),
    parentId: node?.parentId ?? null,
    ...(node && !node.visible ? { hidden: true as const } : {}),
    ...(node?.isMask
      ? {
          mask: {
            type: node.maskType,
            ...(node.maskInverted ? { inverted: true as const } : {}),
          },
        }
      : {}),
    ...(mask ? { maskedBy: mask } : {}),
  };
}
