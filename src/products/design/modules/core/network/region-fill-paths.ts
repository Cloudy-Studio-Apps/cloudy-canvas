import { deepEqual } from "@canvas";

import type { VectorNetwork } from "./network.types";

const PREFIX = "network.regions.";
const FILLS_PATH = /^network\.regions\.(\d+)\.fills$/;

/** Where a vector's area `i` keeps its own fills, as bindings and agents name it. */
export function regionFillsPath(i: number): string {
  return `${PREFIX}${i}.fills`;
}

/** The area a `network.regions.<i>.fills` path names; `null` for any other path. */
export function regionOfFillsPath(path: string): number | null {
  const match = FILLS_PATH.exec(path);
  return match?.[1] === undefined ? null : Number(match[1]);
}

/** The bindings field areas live under, for remapping bindings when areas move. */
export const REGIONS_FIELD = "network.regions";

/**
 * Where each area of `before` is in `after`, for bindings to follow them: the area with the same
 * id; for areas without ids (an agent's network without them), the same index while the count
 * stays (edits that keep areas keep their order); else, as edits only drop areas or add them
 * at the end, each area with fills of its own matched in order to the next area of `after` with
 * the same fills (by value, so an agent's JSON matches too). Areas without fills of their own carry
 * no bindings and map nowhere.
 */
export function regionIndexMap(
  before: VectorNetwork,
  after: VectorNetwork,
): (i: number) => number | null {
  const byId = new Map<string, number>();
  after.regions.forEach((region, j) => {
    if (region.id) byId.set(region.id, j);
  });
  const fallback = matchByPlace(before, after);
  return (i) => {
    const id = before.regions[i]?.id;
    if (id === undefined || byId.size === 0) return fallback(i);
    return byId.get(id) ?? null;
  };
}

/** `regionIndexMap` for regions without ids: by place, or in order by equal fills. */
function matchByPlace(before: VectorNetwork, after: VectorNetwork): (i: number) => number | null {
  if (before.regions.length === after.regions.length) {
    return (i) => (i < after.regions.length ? i : null);
  }
  const moved = new Map<number, number>();
  let next = 0;
  before.regions.forEach((region, i) => {
    const fills = region.fills;
    if (!fills) return;
    for (let j = next; j < after.regions.length; j++) {
      const other = after.regions[j]?.fills;
      if (other && (other === fills || deepEqual(other, fills))) {
        moved.set(i, j);
        next = j + 1;
        return;
      }
    }
  });
  return (i) => moved.get(i) ?? null;
}
