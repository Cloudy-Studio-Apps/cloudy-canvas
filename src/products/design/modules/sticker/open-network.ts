import type { PathShape } from "@canvas";

import type { VectorNetwork } from "../core";

/**
 * A network of a shape's contours as they are, with no regions (strokes only): each contour a
 * chain, a closed one joined back at its start.
 */
export function openNetwork(shape: PathShape): VectorNetwork {
  const net: VectorNetwork = { vertices: [], segments: [], regions: [] };
  for (const contour of shape.contours) {
    const first = net.vertices.length;
    net.vertices.push(contour.start);
    let from = contour.start;
    contour.segments.forEach(({ c1, c2, to }, i) => {
      const last = i === contour.segments.length - 1;
      const start = net.vertices.length - 1;
      const closes = last && contour.closed;
      if (!closes) net.vertices.push(to);
      net.segments.push({
        start: closes ? net.vertices.length - 1 : start,
        end: closes ? first : net.vertices.length - 1,
        tangentStart: { x: c1.x - from.x, y: c1.y - from.y },
        tangentEnd: { x: c2.x - to.x, y: c2.y - to.y },
      });
      from = to;
    });
  }
  return net;
}
