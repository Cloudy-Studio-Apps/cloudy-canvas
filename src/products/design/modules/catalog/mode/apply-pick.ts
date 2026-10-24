import { readingOrder } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { currentBrochure, ensureBrochure, isPageFrame } from "../model";

/**
 * Makes the page's open brochure what the pick tool ticked (one undo step; a page without a
 * brochure gets one): unticked pages go, new frames are added in reading order (rows, left to
 * right).
 */
export function applyPick(workspace: DesignWorkspace): void {
  const frames = workspace.elements().filter(isPageFrame);
  const ticked = new Set(workspace.selectedIds());
  const order = readingOrder(
    frames.filter((frame) => ticked.has(frame.id)).map((frame) => ({ id: frame.id, rect: frame })),
  ).map((item) => item.id);
  const onPage = new Set(frames.map((frame) => frame.id));
  // Nothing ticked on a page without a brochure makes none.
  if (order.length === 0 && !currentBrochure(workspace)) return;
  ensureBrochure(workspace).pick(order, onPage);
}
