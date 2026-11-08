import type { DesignNode } from "../../node/design-node.types";
import type { VectorNetwork } from "../../network/network.types";

export interface RegionFillSectionProps {
  /** The vector whose areas are edited. */
  node: DesignNode & { network: VectorNetwork };
  /** The picked areas: indexes of its network's regions, all of them there. */
  regions: readonly number[];
}
