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
 * Where each area of `before` is in `after`, for bindings to follow them: the same index while the
 * count stays (edits that keep areas keep their order), else the area keeping the same fills
 * (edits copy an area's fills along), else gone.
 */
export function regionIndexMap(
  before: VectorNetwork,
  after: VectorNetwork,
): (i: number) => number | null {
  if (before.regions.length === after.regions.length) {
    return (i) => (i < after.regions.length ? i : null);
  }
  return (i) => {
    const fills = before.regions[i]?.fills;
    if (!fills) return null;
    const found = after.regions.findIndex((region) => region.fills === fills);
    return found >= 0 ? found : null;
  };
}
