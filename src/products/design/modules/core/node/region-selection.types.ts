import type { RegionPick } from "../network/region-picks.types";

/**
 * Regions of one vector picked in its edit mode, whose fills the Fill section edits; find them in
 * the vector's network as it is now with `liveRegions`.
 */
export interface RegionTarget {
  elementId: string;
  picks: readonly RegionPick[];
}
