import { SIDE_DIRECTIONS, SIDES, sideAnchor } from "../connectors";
import type { ConnectorSide } from "../document";
import type { Point } from "../geometry.types";
import type { ResizableShape } from "./handles.types";

/** Distance of the quick-connect dots from the shape, and their grab radius, in screen px. */
const OFFSET_PX = 18;
const RADIUS_PX = 7;

/** World position of the quick-connect dot next to a side. */
export function quickConnectPoint(shape: ResizableShape, side: ConnectorSide, zoom: number): Point {
  const anchor = sideAnchor(shape, side);
  const dir = SIDE_DIRECTIONS[side];
  return { x: anchor.x + (dir.x * OFFSET_PX) / zoom, y: anchor.y + (dir.y * OFFSET_PX) / zoom };
}

export function quickConnectAt(
  shape: ResizableShape,
  p: Point,
  zoom: number,
): ConnectorSide | null {
  const reach = RADIUS_PX / zoom;
  return (
    SIDES.find((side) => {
      const q = quickConnectPoint(shape, side, zoom);
      return Math.hypot(p.x - q.x, p.y - q.y) <= reach;
    }) ?? null
  );
}
