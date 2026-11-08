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

/** A node's network when it has one (a vector), to read its areas' fills. */
export function networkOf(node: object): VectorNetwork | null {
  const net = (node as { network?: unknown }).network;
  return typeof net === "object" && net !== null && "regions" in net
    ? (net as VectorNetwork)
    : null;
}

/**
 * The fills that show on a node: its own when one is visible, else, for a vector whose areas have
 * fills of their own, the first area's visible ones (what a single paint stack can keep of it).
 */
export function shownFills(node: { fills: readonly Paint[] }): readonly Paint[] {
  if (node.fills.some((paint) => paint.visible)) return node.fills;
  for (const region of networkOf(node)?.regions ?? []) {
    if (region.fills?.some((paint) => paint.visible)) return region.fills;
  }
  return node.fills;
}
