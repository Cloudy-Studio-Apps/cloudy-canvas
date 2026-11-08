import type { VectorNetwork } from "../../modules";

/** A decoded vector network blob and each region's style id (0: the node's own fill). */
export interface DecodedNetwork {
  network: VectorNetwork;
  regionStyles: number[];
}
