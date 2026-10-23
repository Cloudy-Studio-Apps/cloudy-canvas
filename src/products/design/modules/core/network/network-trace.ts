import type { Graphics } from "pixi.js";

import { strokeChains } from "./network-chains";
import { loopCurves } from "./network-curves";
import type { CubicCurve, VectorNetwork } from "./network.types";

/** Adds curves that follow each other to the path (the first one starts it). */
function traceCurves(g: Graphics, curves: readonly CubicCurve[], close: boolean): void {
  const [first] = curves;
  if (!first) return;
  g.moveTo(first[0].x, first[0].y);
  for (const [, c1, c2, end] of curves) g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
  if (close) g.closePath();
}

/**
 * Traces every segment for stroking, as chains through the vertices joining exactly two of them,
 * so strokes turn there instead of ending (closed chains are closed).
 */
export function traceStrokes(g: Graphics, net: VectorNetwork): void {
  for (const { curves, closed } of strokeChains(net)) traceCurves(g, curves, closed);
}

/** Traces the filled regions' loops (each closed). */
export function traceRegions(g: Graphics, net: VectorNetwork): void {
  for (const region of net.regions) {
    for (const loop of region.loops) traceCurves(g, loopCurves(net, loop), true);
  }
}
