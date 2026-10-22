import { summarizeElement, type CanvasElement, type ElementKinds } from "@canvas";

import { isDesignNode } from "../node";
import type { NodeSummary } from "./summarize-node.types";

export function summarizeNode(kinds: ElementKinds, el: CanvasElement): NodeSummary {
  const node = isDesignNode(el) ? el : null;
  return {
    ...summarizeElement(kinds, el),
    parentId: node?.parentId ?? null,
    ...(node && !node.visible ? { hidden: true as const } : {}),
  };
}
