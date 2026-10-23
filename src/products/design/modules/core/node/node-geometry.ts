import { booleanPaths, LruCache } from "@canvas";

import { regionPath, strokePath, type VectorNetwork } from "../network";
import type { NodeGeometry } from "./design-node.types";

/**
 * Nodes' geometry by kind and shape key (see `DesignNodeKind.geometry`), shared by every design
 * open: redrawing, hit tests, masks and booleans read it without working it out again.
 */
export const GEOMETRY_CACHE = new LruCache<string, NodeGeometry | null>(2048);

/** No shape: nothing filled or stroked. */
export const EMPTY_GEOMETRY: NodeGeometry = { fill: { contours: [] }, stroke: { contours: [] } };

/**
 * A network's geometry: its regions filled and its segments stroked. `normalize` resolves its
 * regions by their winding rules (holes, overlaps, self-crossings); shapes known to be simple
 * outlines (a box, an ellipse, a polygon) skip it.
 */
export function networkGeometry(net: VectorNetwork, normalize: boolean): NodeGeometry {
  const regions = net.regions.map((region) => ({
    shape: regionPath(net, region),
    fillRule: region.windingRule,
  }));
  const fill = normalize
    ? booleanPaths("union", regions)
    : { contours: regions.flatMap((region) => region.shape.contours) };
  return { fill, stroke: strokePath(net) };
}
