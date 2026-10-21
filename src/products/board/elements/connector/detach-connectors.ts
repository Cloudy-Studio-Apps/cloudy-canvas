import type { CanvasDocument, CanvasElement, ElementPatch, Point } from "@canvas";

import { connectorEndpoints } from "./connector-endpoints";
import type { ConnectorElement, ConnectorEnd } from "./connector.types";
import { isConnector } from "./is-connector";

/**
 * After a deletion, connectors attached to a removed element keep that end where it was, now
 * free. `before` are the scene's elements from before the deletion (connectors resolved).
 */
export function detachConnectors(
  doc: CanvasDocument,
  removed: ReadonlySet<string>,
  before: readonly CanvasElement[],
): void {
  for (const resolved of before) {
    if (!isConnector(resolved) || removed.has(resolved.id)) continue;
    const { start, end } = resolved;
    const startGone = start.shapeId !== null && removed.has(start.shapeId);
    const endGone = end.shapeId !== null && removed.has(end.shapeId);
    if (!startGone && !endGone) continue;
    const points = connectorEndpoints(resolved);
    const patch: ElementPatch<ConnectorElement> = {
      start: startGone ? freeEnd(points.start) : start,
      end: endGone ? freeEnd(points.end) : end,
    };
    doc.update(resolved.id, patch);
  }
}

function freeEnd(at: Point): ConnectorEnd {
  return { shapeId: null, side: null, x: Math.round(at.x), y: Math.round(at.y) };
}
