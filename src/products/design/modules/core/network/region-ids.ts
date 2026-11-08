import { createId } from "@shared/core";

import type { VectorNetwork, VectorRegion } from "./network.types";

/**
 * The network with an id on every region (`createId`), so picks and bindings find an area
 * whatever edits renumber; ids already there stay, and a repeated one is replaced. The same
 * network when nothing changes. Run where networks are written (new vectors, edits, agents,
 * imports).
 */
export function withRegionIds(net: VectorNetwork): VectorNetwork {
  const seen = new Set<string>();
  let changed = false;
  const regions = net.regions.map((region): VectorRegion => {
    if (region.id && !seen.has(region.id)) {
      seen.add(region.id);
      return region;
    }
    changed = true;
    const id = createId();
    seen.add(id);
    return { ...region, id };
  });
  return changed ? { ...net, regions } : net;
}

/**
 * A network saved before regions had ids, with ids from their places (`area-0`, …), the same
 * every time it's read, so the first edit keeps them; any other network as it is.
 */
export function withLegacyRegionIds(net: VectorNetwork): VectorNetwork {
  if (net.regions.length === 0 || net.regions.some((region) => region.id)) return net;
  return { ...net, regions: net.regions.map((region, i) => ({ ...region, id: `area-${i}` })) };
}
