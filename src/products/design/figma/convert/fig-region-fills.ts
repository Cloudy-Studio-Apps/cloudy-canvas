import type { FigNode } from "@canvas/figma";
import type { FigmaContext } from "../figma-warning.types";

import type { VectorNetwork } from "../../modules";
import { convertPaints } from "./fig-paints";
import type { DecodedNetwork } from "./fig-network.types";

/**
 * The decoded network with each region's own fills, as Figma gives them: a region's style id is
 * an entry of the vector's `styleOverrideTable` (color styles already applied), whose fill
 * paints are that region's. Style 0, a style the table lacks, or an entry without fill paints
 * leaves the region showing the vector's fills.
 */
export function withRegionFills(
  decoded: DecodedNetwork,
  node: FigNode,
  ctx: FigmaContext,
): VectorNetwork {
  const table = node.vectorData?.styleOverrideTable ?? [];
  if (table.length === 0) return decoded.network;
  const entries = new Map(table.map((entry) => [entry.styleID ?? 0, entry]));
  const { network, regionStyles } = decoded;
  return {
    ...network,
    regions: network.regions.map((region, i) => {
      const style = regionStyles[i] ?? 0;
      const paints = style === 0 ? undefined : entries.get(style)?.fillPaints;
      return paints ? { ...region, fills: convertPaints(paints, ctx) } : region;
    }),
  };
}
