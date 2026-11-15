import type { CanvasDocument } from "@canvas";

import { isFlow } from "./is-flow";

/** A page split out into a new file keeps its prototype flows (nothing when it has none). */
export function copyFlowsForSplit(
  source: CanvasDocument,
  target: CanvasDocument,
  pageId: string,
): void {
  const flows = source.all().filter((el) => isFlow(el) && el.page === pageId);
  if (flows.length > 0) target.addAllUntracked(flows);
}
