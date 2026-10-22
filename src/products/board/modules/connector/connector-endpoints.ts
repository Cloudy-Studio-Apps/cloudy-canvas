import type { Point } from "@canvas";

import type { ConnectorElement } from "./connector.types";

/** World positions of a resolved connector's two ends. */
export function connectorEndpoints(el: ConnectorElement): { start: Point; end: Point } {
  const { points, x, y } = el;
  const n = points.length;
  return {
    start: { x: x + (points[0] ?? 0), y: y + (points[1] ?? 0) },
    end: { x: x + (points[n - 2] ?? 0), y: y + (points[n - 1] ?? 0) },
  };
}
