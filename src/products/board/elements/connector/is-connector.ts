import type { CanvasElement } from "@canvas";

import type { ConnectorElement } from "./connector.types";

export function isConnector(el: CanvasElement | undefined): el is ConnectorElement {
  return el?.type === "connector";
}
