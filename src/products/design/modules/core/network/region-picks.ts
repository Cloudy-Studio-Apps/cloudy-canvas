import type { VectorNetwork, VectorRegion } from "./network.types";
import type { RegionPick } from "./region-picks.types";

/** What tells a region apart from the others: its loops of segment indexes. */
export function regionKey(region: VectorRegion): string {
  return JSON.stringify(region.loops);
}

/** Picks of these regions of `net`, as they are now. */
export function pickRegions(net: VectorNetwork, regions: Iterable<number>): RegionPick[] {
  return [...regions].flatMap((index) => {
    const region = net.regions[index];
    return region ? [{ index, key: regionKey(region) }] : [];
  });
}

/**
 * Where picked regions are in `net` now: at their index while the region there is the same, else
 * wherever a region with their key is (an undo put one back before them), else gone.
 */
export function liveRegions(net: VectorNetwork, picks: readonly RegionPick[]): number[] {
  const found = new Set<number>();
  for (const pick of picks) {
    const same = net.regions[pick.index];
    if (same && regionKey(same) === pick.key) {
      found.add(pick.index);
      continue;
    }
    const moved = net.regions.findIndex((region) => regionKey(region) === pick.key);
    if (moved >= 0) found.add(moved);
  }
  return [...found].sort((a, b) => a - b);
}
