import type { CanvasDocument } from "@canvas";

import { PROTOTYPE_FLOW_TYPE } from "../prototype.constants";
import type { PrototypeFlowElement } from "./flow.types";
import { isFlow } from "./is-flow";

const byIndex = (a: PrototypeFlowElement, b: PrototypeFlowElement): number =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/** Every flow of the document, in `index` order. */
export function allFlows(doc: CanvasDocument): PrototypeFlowElement[] {
  const flows: PrototypeFlowElement[] = [];
  for (const id of doc.ids()) {
    if (doc.field(id, "type") !== PROTOTYPE_FLOW_TYPE) continue;
    const el = doc.get(id);
    if (isFlow(el)) flows.push(el);
  }
  return flows.sort(byIndex);
}
