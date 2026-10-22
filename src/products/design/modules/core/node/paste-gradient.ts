import type { CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import type { DesignNode } from "./design-node.types";
import { cssGradientPaint, isCssGradient } from "./gradient-args";
import { isDesignNode } from "./is-design-node";
import { isNodeKind } from "./node-parent";

/**
 * A CSS gradient pasted while layers are selected becomes their fill (the `pasteOnto` hook),
 * laid on each layer's box; layers without fills are left alone. `null` for any other text.
 */
export function pasteGradientOnto(
  text: string,
  selected: readonly CanvasElement[],
  kinds: ElementKinds<object>,
): Map<string, ElementPatch> | null {
  const css = text.trim();
  if (!isCssGradient(css)) return null;
  const patches = new Map<string, ElementPatch>();
  try {
    for (const el of selected) {
      const kind = kinds.kindOf(el);
      if (!isDesignNode(el) || !isNodeKind(kind) || !kind.fillable) continue;
      const patch: ElementPatch<DesignNode> = {
        fills: [cssGradientPaint(css, "fill", { w: el.w, h: el.h })],
      };
      patches.set(el.id, patch as ElementPatch);
    }
  } catch {
    // Not a gradient after all: pasted as text.
    return null;
  }
  return patches.size > 0 ? patches : null;
}
