import type { PathShape } from "@canvas";

import type { VectorNetwork, VectorRegion } from "./network.types";

/** One region of a network as a normalized shape (its winding rule resolved), by its index. */
export interface RegionShape {
  region: number;
  shape: PathShape;
}

/** One region's shape, kept by its loops while the curves it follows stay the same objects. */
export interface RegionShapeEntry {
  vertices: VectorNetwork["vertices"];
  segments: VectorNetwork["segments"];
  windingRule: VectorRegion["windingRule"];
  shape: PathShape;
}
