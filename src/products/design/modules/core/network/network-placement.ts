import { rotatePoint, type Rect } from "@canvas";

import { networkBounds } from "./network-geometry";
import type { VectorNetwork } from "./network.types";

/**
 * A network re-based so what it draws starts at (0, 0), with the node's new box: a node at
 * `origin` whose network changed moves and resizes to wrap it (a mirrored one, `w` wide, keeps
 * drawing it where it was).
 */
export function placeNetwork(
  origin: { x: number; y: number; rotation?: number; w?: number; mirrored?: boolean },
  net: VectorNetwork,
): Rect & { network: VectorNetwork } {
  const bounds = networkBounds(net);
  const network: VectorNetwork = {
    ...net,
    vertices: net.vertices.map((v) => ({ x: v.x - bounds.x, y: v.y - bounds.y })),
  };
  // A turned node's new corner is the old one moved along its own (turned) axes.
  // Mirrored, the box's corner is on the right of what it draws.
  const left = origin.mirrored ? (origin.w ?? 0) - bounds.x - bounds.w : bounds.x;
  const corner = rotatePoint(
    { x: origin.x + left, y: origin.y + bounds.y },
    origin,
    origin.rotation ?? 0,
  );
  return { x: corner.x, y: corner.y, w: bounds.w, h: bounds.h, network };
}

/** The network stretched by `sx`, `sy` (a resized node), tangents included. */
export function scaleNetwork(net: VectorNetwork, sx: number, sy: number): VectorNetwork {
  const scale = (p: { x: number; y: number }) => ({ x: p.x * sx, y: p.y * sy });
  return {
    ...net,
    vertices: net.vertices.map(scale),
    segments: net.segments.map((s) => ({
      ...s,
      tangentStart: scale(s.tangentStart),
      tangentEnd: scale(s.tangentEnd),
    })),
  };
}
