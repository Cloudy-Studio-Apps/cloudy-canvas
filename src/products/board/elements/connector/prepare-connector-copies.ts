import type { CanvasElement, CopyContext } from "@canvas";

import { connectorEndpoints } from "./connector-endpoints";
import type { ConnectorElement } from "./connector.types";
import { freeEnd } from "./detach-connectors";
import { isConnector } from "./is-connector";

/**
 * Ends of copied connectors attached to elements that weren't copied become free where they were,
 * so the copy doesn't snap back onto the originals. Copies come from the scene, so their geometry
 * is resolved.
 */
export function prepareConnectorCopies(
  copies: CanvasElement[],
  { copied }: CopyContext,
): CanvasElement[] {
  return copies.map((el) => {
    if (!isConnector(el)) return el;
    const loose = (shapeId: string | null) => shapeId !== null && !copied.has(shapeId);
    if (!loose(el.start.shapeId) && !loose(el.end.shapeId)) return el;
    const points = connectorEndpoints(el);
    return {
      ...el,
      start: loose(el.start.shapeId) ? freeEnd(points.start) : el.start,
      end: loose(el.end.shapeId) ? freeEnd(points.end) : el.end,
    } satisfies ConnectorElement;
  });
}
