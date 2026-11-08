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
    if (!region) return [];
    return [{ index, key: regionKey(region), ...(region.id ? { id: region.id } : {}) }];
  });
}

/**
 * Where picked regions are in `net` now: the region with their id; for regions without ids (a
 * network an agent wrote without them), at their index while the region there is the same, else
 * wherever a region with their key is (an undo put one back before them); else gone.
 */
export function liveRegions(net: VectorNetwork, picks: readonly RegionPick[]): number[] {
  const found = new Set<number>();
  const byId = new Map<string, number>();
  net.regions.forEach((region, i) => {
    if (region.id) byId.set(region.id, i);
  });
  for (const pick of picks) {
    const withId = pick.id === undefined ? undefined : byId.get(pick.id);
    if (withId !== undefined) {
      found.add(withId);
      continue;
    }
    if (pick.id !== undefined && byId.size > 0) continue;
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
