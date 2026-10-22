import type { Rect } from "@canvas";

import { networkBounds } from "./network-geometry";
import type { VectorNetwork } from "./network.types";

/**
 * A network re-based so what it draws starts at (0, 0), with the node's new box: a node at
 * `origin` whose network changed moves and resizes to wrap it.
 */
export function placeNetwork(
  origin: { x: number; y: number },
  net: VectorNetwork,
): Rect & { network: VectorNetwork } {
  const bounds = networkBounds(net);
  const network: VectorNetwork = {
    ...net,
    vertices: net.vertices.map((v) => ({ x: v.x - bounds.x, y: v.y - bounds.y })),
  };
  return { x: origin.x + bounds.x, y: origin.y + bounds.y, w: bounds.w, h: bounds.h, network };
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
