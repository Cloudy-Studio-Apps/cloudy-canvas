import type { ScaleTransform } from "@canvas";

import type { DesignNode } from "./design-node.types";
import { DEFAULT_TILE_SCALE } from "./image-paint";
import type { Paint } from "./paint.types";

/** Its tiled image fills with tiles scaled by `t` (the rest of the paints follow the box). */
export function scaleTiles(node: DesignNode, t: ScaleTransform): Partial<DesignNode> {
  const fills = scaleTilePaints(node.fills, t);
  return fills ? { fills } : {};
}

/** Paints with their tiled images' tiles scaled by `t`; `null` when none is tiled. */
export function scaleTilePaints(paints: readonly Paint[], t: ScaleTransform): Paint[] | null {
  if (!paints.some(isTiled)) return null;
  return paints.map((paint) =>
    paint.type === "image" && paint.scaleMode === "tile"
      ? { ...paint, scalingFactor: (paint.scalingFactor ?? DEFAULT_TILE_SCALE) * t.factor }
      : paint,
  );
}

function isTiled(paint: Paint): boolean {
  return paint.type === "image" && paint.scaleMode === "tile";
}
