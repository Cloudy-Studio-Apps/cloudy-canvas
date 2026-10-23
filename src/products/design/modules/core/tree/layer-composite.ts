import type { CanvasElement, ElementKinds } from "@canvas";

import { DesignNodeKind, isDesignNode, opacityCoversChildren } from "../node";
import type { LayerComposite } from "./tree-slots.types";

/**
 * What a node's scope composites it with, or `null` when it needs no compositing: the opacity of
 * a frame, section or group (which covers what it holds; other layers draw their own) and any
 * blend mode but normal and pass-through.
 */
export function layerComposite(el: CanvasElement, kinds: ElementKinds): LayerComposite | null {
  if (!isDesignNode(el) || !el.visible) return null;
  const kind = kinds.kindOf(el);
  const opacity = kind instanceof DesignNodeKind && opacityCoversChildren(kind) ? el.opacity : 1;
  const blendMode = el.blendMode === "pass-through" ? "normal" : el.blendMode;
  return opacity < 1 || blendMode !== "normal" ? { opacity, blendMode } : null;
}
