import { createElementBase } from "@canvas";

import { CONNECTOR_DEFAULTS } from "./connector.defaults";
import type { ConnectorElement, ConnectorEnd, ConnectorLook } from "./connector.types";

/** Connector between two ends; its bounds and route are filled in when the scene resolves it. */
export function createConnector(
  start: ConnectorEnd,
  end: ConnectorEnd,
  { style, color, startHead, endHead }: ConnectorLook,
  index: string,
): ConnectorElement {
  return {
    ...createElementBase("connector", { x: start.x, y: start.y, w: 0, h: 0 }, index),
    start,
    end,
    style,
    color,
    size: CONNECTOR_DEFAULTS.lineWidth,
    startHead,
    endHead,
    points: [0, 0, end.x - start.x, end.y - start.y],
  };
}
