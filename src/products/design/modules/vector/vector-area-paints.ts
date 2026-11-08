import type { ScaleTransform } from "@canvas";

import {
  flipPaintList,
  scaleTilePaints,
  type FlipAxis,
  type ImagePaint,
  type VectorNetwork,
} from "../core";
import type { VectorElement } from "./vector.types";

/** The image paints of the vector's areas' own fills. */
export function areaImages(el: VectorElement): ImagePaint[] {
  return el.network.regions.flatMap((region) =>
    (region.fills ?? []).filter((paint): paint is ImagePaint => paint.type === "image"),
  );
}

/** The network with its areas' tiled pictures' tiles scaled by `t`; `null` when none is tiled. */
export function scaleAreaTiles(net: VectorNetwork, t: ScaleTransform): VectorNetwork | null {
  if (!net.regions.some((region) => region.fills && scaleTilePaints(region.fills, t))) return null;
  const regions = net.regions.map((region) => {
    const fills = region.fills && scaleTilePaints(region.fills, t);
    return fills ? { ...region, fills } : region;
  });
  return { ...net, regions };
}

/** The network's areas' own gradients flipped on `axis`, as a flipped layer's are. */
export function flipAreaFills(net: VectorNetwork, axis: FlipAxis): VectorNetwork["regions"] {
  return net.regions.map((region) =>
    region.fills ? { ...region, fills: flipPaintList(region.fills, axis) } : region,
  );
}
