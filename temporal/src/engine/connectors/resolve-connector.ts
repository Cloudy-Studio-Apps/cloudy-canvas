import {
  isConnectable,
  type ConnectableShape,
  type ConnectorEnd,
  type ConnectorShape,
} from "../document";
import { boundsOfPoints } from "../geometry";
import type { Point } from "../geometry.types";
import { facingSide, shapeCenter, SIDE_DIRECTIONS, sideAnchor } from "./connector-anchor";
import { elbowRoute } from "./elbow-route";
import type { ResolvedEnd, ShapeLookup } from "./resolve-connector.types";

/** Room around the route for arrowheads, so bounds (and hit-testing) include them. */
const HEAD_ROOM = 10;

/**
 * Computes a connector's route from the current positions of the shapes it's attached to, and
 * returns a copy with up-to-date bounds and `points`. The stored copy is never trusted for geometry.
 */
export function resolveConnector(connector: ConnectorShape, lookup: ShapeLookup): ConnectorShape {
  const startShape = attached(connector.start, connector.id, lookup);
  const endShape = attached(connector.end, connector.id, lookup);
  // Each attached end faces the other end (its shape's center, or its free point).
  const startTarget = endShape ? shapeCenter(endShape) : connector.end;
  const endTarget = startShape ? shapeCenter(startShape) : connector.start;
  const start = resolveEnd(connector.start, startShape, startTarget);
  const end = resolveEnd(connector.end, endShape, endTarget);

  const route =
    connector.style === "elbow"
      ? elbowRoute(start.point, start.dir, end.point, end.dir)
      : [start.point, end.point];
  const flat = route.flatMap((p) => [p.x, p.y]);
  const bounds = boundsOfPoints(flat);
  const pad = connector.size / 2 + HEAD_ROOM;
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

/** World positions of a resolved connector's two ends. */
export function connectorEndpoints(connector: ConnectorShape): { start: Point; end: Point } {
  const { points, x, y } = connector;
  const n = points.length;
  return {
    start: { x: x + (points[0] ?? 0), y: y + (points[1] ?? 0) },
    end: { x: x + (points[n - 2] ?? 0), y: y + (points[n - 1] ?? 0) },
  };
}

function attached(
  end: ConnectorEnd,
  selfId: string,
  lookup: ShapeLookup,
): ConnectableShape | undefined {
  if (!end.shapeId || end.shapeId === selfId) return undefined;
  const shape = lookup(end.shapeId);
  return isConnectable(shape) ? shape : undefined;
}

function resolveEnd(
  end: ConnectorEnd,
  shape: ConnectableShape | undefined,
  target: Point,
): ResolvedEnd {
  if (!shape) return { point: { x: end.x, y: end.y }, dir: null };
  const side = end.side ?? facingSide(shape, target);
  return { point: sideAnchor(shape, side), dir: SIDE_DIRECTIONS[side] };
}
