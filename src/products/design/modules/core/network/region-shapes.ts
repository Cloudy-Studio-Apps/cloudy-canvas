import { booleanPaths, type PathShape } from "@canvas";

import { regionPath } from "./network-path";
import type { VectorNetwork, VectorRegion } from "./network.types";
import type { RegionShape, RegionShapeEntry } from "./region-shapes.types";

/** Networks are replaced, never changed, when edited: their shapes are worked out once. */
const BY_NETWORK = new WeakMap<VectorNetwork, readonly RegionShape[]>();

/**
 * Regions keep their `loops` when only their fills change (a color drag), so a new network with
 * the same curves reuses the shapes instead of normalizing every region again.
 */
const BY_LOOPS = new WeakMap<number[][], RegionShapeEntry>();

/**
 * Each region of `net` as its own normalized shape (holes, overlaps and self-crossings resolved by
 * its winding rule), bottom to top: what a vector with per-region fills draws and hit-tests.
 */
export function regionShapes(net: VectorNetwork): readonly RegionShape[] {
  const known = BY_NETWORK.get(net);
  if (known) return known;
  const shapes = net.regions.map((region, i) => ({ region: i, shape: shapeOf(net, region) }));
  BY_NETWORK.set(net, shapes);
  return shapes;
}

function shapeOf(net: VectorNetwork, region: VectorRegion): PathShape {
  const entry = BY_LOOPS.get(region.loops);
  if (
    entry &&
    entry.vertices === net.vertices &&
    entry.segments === net.segments &&
    entry.windingRule === region.windingRule
  ) {
    return entry.shape;
  }
  const shape = booleanPaths("union", [
    { shape: regionPath(net, region), fillRule: region.windingRule },
  ]);
  BY_LOOPS.set(region.loops, {
    vertices: net.vertices,
    segments: net.segments,
    windingRule: region.windingRule,
    shape,
  });
  return shape;
}
