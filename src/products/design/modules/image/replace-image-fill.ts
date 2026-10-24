import type { ElementPatch } from "@canvas";

import type { DesignNode, Paint } from "../core";

/**
 * Puts another picture (`assetId`) in a layer's image fill `fill` (its index among the layer's
 * fills), keeping how the fill places it: its mode, crop, turn, tile scale and opacity. Throws
 * when that fill isn't an image.
 */
export function replaceImageFill(
  node: DesignNode,
  fill: number,
  assetId: string,
): ElementPatch<DesignNode> {
  const paint = node.fills[fill];
  if (paint?.type !== "image") throw new Error(`Fill ${fill} of “${node.name}” isn't an image.`);
  const fills: Paint[] = node.fills.map((other, i) => (i === fill ? { ...paint, assetId } : other));
  return { fills };
}

/** The index of a layer's first image fill, or -1 without one. */
export function firstImageFill(node: DesignNode): number {
  return node.fills.findIndex((paint) => paint.type === "image");
}
