import type { PathShape } from "@canvas";

/** One region of a network as a normalized shape (its winding rule resolved), by its index. */
export interface RegionShape {
  region: number;
  shape: PathShape;
}
