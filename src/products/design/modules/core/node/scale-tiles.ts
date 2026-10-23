import type { ScaleTransform } from "@canvas";

import type { DesignNode } from "./design-node.types";
import { DEFAULT_TILE_SCALE } from "./image-paint";

/** Its tiled image fills with tiles scaled by `t` (the rest of the paints follow the box). */
export function scaleTiles(node: DesignNode, t: ScaleTransform): Partial<DesignNode> {
  if (!node.fills.some((paint) => paint.type === "image" && paint.scaleMode === "tile")) return {};
  return {
    fills: node.fills.map((paint) =>
      paint.type === "image" && paint.scaleMode === "tile"
        ? { ...paint, scalingFactor: (paint.scalingFactor ?? DEFAULT_TILE_SCALE) * t.factor }
        : paint,
    ),
  };
}
