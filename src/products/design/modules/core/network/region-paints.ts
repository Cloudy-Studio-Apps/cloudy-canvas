import type { Paint } from "../node/paint.types";
import type { VectorNetwork, VectorRegion } from "./network.types";

/** What a region is filled with: its own fills, or the layer's when it has none. */
export function regionPaints(
  region: VectorRegion,
  node: { fills: readonly Paint[] },
): readonly Paint[] {
  return region.fills ?? node.fills;
}

/** Whether some region of the network has fills of its own (it's then drawn region by region). */
export function hasOwnRegionFills(net: VectorNetwork): boolean {
  return net.regions.some((region) => region.fills !== undefined);
}
