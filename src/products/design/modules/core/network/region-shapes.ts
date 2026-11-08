import { booleanPaths } from "@canvas";

import { regionPath } from "./network-path";
import type { VectorNetwork } from "./network.types";
import type { RegionShape } from "./region-shapes.types";

/** Networks are replaced, never changed, when edited: their shapes are worked out once. */
const CACHE = new WeakMap<VectorNetwork, readonly RegionShape[]>();

/**
 * Each region of `net` as its own normalized shape (holes, overlaps and self-crossings resolved by
 * its winding rule), bottom to top: what a vector with per-region fills draws and hit-tests.
 */
export function regionShapes(net: VectorNetwork): readonly RegionShape[] {
  const known = CACHE.get(net);
  if (known) return known;
  const shapes = net.regions.map((region, i) => ({
    region: i,
    shape: booleanPaths("union", [
      { shape: regionPath(net, region), fillRule: region.windingRule },
    ]),
  }));
  CACHE.set(net, shapes);
  return shapes;
}
