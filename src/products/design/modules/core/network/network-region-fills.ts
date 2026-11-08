import type { Paint } from "../node/paint.types";
import type { VectorNetwork, VectorRegion } from "./network.types";

/**
 * A copy of `net` whose listed regions have `fills` as their own, or show the layer's fills again
 * when `fills` is `undefined`. Indexes that aren't regions are ignored.
 */
export function setRegionFills(
  net: VectorNetwork,
  regions: readonly number[],
  fills: Paint[] | undefined,
): VectorNetwork {
  const picked = new Set(regions);
  return {
    ...net,
    regions: net.regions.map((region, i) => (picked.has(i) ? withFills(region, fills) : region)),
  };
}

function withFills(region: VectorRegion, fills: Paint[] | undefined): VectorRegion {
  if (fills) return { ...region, fills };
  return { loops: region.loops, windingRule: region.windingRule };
}

/** A copy of `net` without the listed regions (their areas unfilled, as the paint bucket does). */
export function removeRegions(net: VectorNetwork, regions: readonly number[]): VectorNetwork {
  const dropped = new Set(regions);
  return { ...net, regions: net.regions.filter((_, i) => !dropped.has(i)) };
}
