import { readingOrder } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_BROCHURE, isPageFrame } from "../model";

/**
 * Makes the brochure what the pick tool ticked on the page on screen (one undo step): unticked
 * pages of this page go, new frames are added in reading order (rows, left to right), pages of
 * other design pages stay.
 */
export function applyPick(workspace: DesignWorkspace): void {
  const frames = workspace.elements().filter(isPageFrame);
  const ticked = new Set(workspace.selectedIds());
  const order = readingOrder(
    frames.filter((frame) => ticked.has(frame.id)).map((frame) => ({ id: frame.id, rect: frame })),
  ).map((item) => item.id);
  workspace.service(DESIGN_BROCHURE).pick(order, new Set(frames.map((frame) => frame.id)));
}
