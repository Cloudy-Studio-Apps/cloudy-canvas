import type { CanvasDocument } from "@canvas";

import { isScreen, type PrototypeFlowElement } from "../model";

/** A flow as agents read it. */
export function describeFlow(doc: CanvasDocument, flow: PrototypeFlowElement) {
  const start = doc.get(flow.start);
  return {
    id: flow.id,
    name: flow.name,
    designPage: flow.page,
    start: flow.start,
    startName: isScreen(start) ? start.name : null,
    platform: flow.platform,
    device: flow.device,
    orientation: flow.orientation,
    hints: flow.hints,
  };
}
