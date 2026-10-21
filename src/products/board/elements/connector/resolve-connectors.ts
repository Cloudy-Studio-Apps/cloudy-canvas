import { boundsOfPoints, type CanvasElement, type ElementKinds, type Point } from "@canvas";

import { CONNECTOR_DEFAULTS } from "./connector.defaults";
import type { ConnectorElement, ConnectorEnd, ResolvedEnd } from "./connector.types";
import { elbowRoute } from "./elbow-route";
import { isConnector } from "./is-connector";
import { centerOf, facingSide, SIDE_DIRECTIONS } from "./sides";

/**
 * Replaces each connector with a copy whose route, bounds and `points` follow the current
 * geometry of the elements it's attached to (resolved elements, e.g. ER boxes, included). Other
 * elements are returned as they were.
 */
export function resolveConnectors(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): CanvasElement[] {
  if (!elements.some(isConnector)) return [...elements];
  const byId = new Map(elements.map((el) => [el.id, el]));
  const attached = (end: ConnectorEnd, selfId: string) => {
    if (!end.shapeId || end.shapeId === selfId) return undefined;
    const el = byId.get(end.shapeId);
    return el && kinds.kindOf(el).connectable ? el : undefined;
  };
  return elements.map((el) =>
    isConnector(el) ? resolveConnector(el, kinds, (end) => attached(end, el.id)) : el,
  );
}

function resolveConnector(
  connector: ConnectorElement,
  kinds: ElementKinds,
  attached: (end: ConnectorEnd) => CanvasElement | undefined,
): ConnectorElement {
  const startEl = attached(connector.start);
  const endEl = attached(connector.end);
  const boxOf = (el: CanvasElement) => kinds.kindOf(el).bounds(el);
  // Each attached end faces the other end (its element's center, or its free point).
  const startTarget = endEl ? centerOf(boxOf(endEl)) : connector.end;
  const endTarget = startEl ? centerOf(boxOf(startEl)) : connector.start;
  const start = resolveEnd(connector.start, startEl, startTarget, kinds);
  const end = resolveEnd(connector.end, endEl, endTarget, kinds);

  const route =
    connector.style === "elbow"
      ? elbowRoute(start.point, start.dir, end.point, end.dir)
      : [start.point, end.point];
  const flat = route.flatMap((p) => [p.x, p.y]);
  const bounds = boundsOfPoints(flat);
  const pad = connector.size / 2 + CONNECTOR_DEFAULTS.headRoom;
  const x = bounds.x - pad;
  const y = bounds.y - pad;
  return {
    ...connector,
    x,
    y,
    w: bounds.w + pad * 2,
    h: bounds.h + pad * 2,
    points: flat.map((value, i) => (i % 2 === 0 ? value - x : value - y)),
  };
}

function resolveEnd(
  end: ConnectorEnd,
  el: CanvasElement | undefined,
  target: Point,
  kinds: ElementKinds,
): ResolvedEnd {
  if (!el) return { point: { x: end.x, y: end.y }, dir: null };
  const kind = kinds.kindOf(el);
  const side = end.side ?? facingSide(kind.bounds(el), target);
  return { point: kind.anchor(el, side), dir: SIDE_DIRECTIONS[side] };
}
