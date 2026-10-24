import { summarizeElement, type CanvasElement, type ElementKinds } from "@canvas";

import { isDesignNode, layoutOf } from "../node";
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
  const layout = layoutOf(el);
  return {
    ...summarizeElement(kinds, el),
    parentId: node?.parentId ?? null,
    ...(node && !node.visible ? { hidden: true as const } : {}),
    ...(node && node.blendMode !== "pass-through" && node.blendMode !== "normal"
      ? { blendMode: node.blendMode }
      : {}),
    ...(node?.isMask
      ? {
          mask: {
            type: node.maskType,
            ...(node.maskInverted ? { inverted: true as const } : {}),
          },
        }
      : {}),
    ...(mask ? { maskedBy: mask } : {}),
    ...(layout ? { layout } : {}),
    ...(node && (node.sizing.h !== "fixed" || node.sizing.v !== "fixed")
      ? { sizing: node.sizing }
      : {}),
    ...(node?.layoutAbsolute ? { layoutAbsolute: true as const } : {}),
    ...(node?.mirrored ? { mirrored: true as const } : {}),
    ...(node?.effects.some((effect) => effect.visible)
      ? { effects: node.effects.filter((effect) => effect.visible).map((effect) => effect.type) }
      : {}),
    ...(el.bindings && Object.keys(el.bindings).length > 0 ? { bindings: el.bindings } : {}),
    ...(el.variableModes && Object.keys(el.variableModes).length > 0
      ? { variableModes: el.variableModes }
      : {}),
  };
}
