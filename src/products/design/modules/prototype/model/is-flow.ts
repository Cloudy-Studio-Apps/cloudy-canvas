import type { CanvasElement } from "@canvas";

import { PROTOTYPE_FLOW_TYPE } from "../prototype.constants";
import type { PrototypeFlowElement } from "./flow.types";

export function isFlow(el: CanvasElement | undefined): el is PrototypeFlowElement {
  return el?.type === PROTOTYPE_FLOW_TYPE;
}
