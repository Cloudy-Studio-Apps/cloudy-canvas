import type { CanvasDocument, ElementPatch, Size } from "@canvas";

import { imagePaint, type DesignNode, type ImagePaint, type Paint } from "../../core";
import { placeholderSvg } from "./placeholder-svg";

/** Placeholder pictures' asset ids start with this, which is how they're told from real ones. */
export const PLACEHOLDER_ASSET_PREFIX = "placeholder:";

/** A placeholder's color when its layer has no solid fill: the design canvas's background. */
export const DEFAULT_PLACEHOLDER_COLOR = "#E4E7EB";

/** The long side placeholder pictures are drawn at; their ids carry the proportions. */
const LONG_SIDE = 1000;

/** Whether an asset is a placeholder picture. */
export function isPlaceholderAsset(assetId: string): boolean {
  return assetId.startsWith(PLACEHOLDER_ASSET_PREFIX);
}

/** Whether a paint shows a placeholder picture. */
export function isPlaceholderPaint(paint: Paint): boolean {
  return paint.type === "image" && isPlaceholderAsset(paint.assetId);
}

/** The color a layer's placeholder takes: its first visible solid fill's, else the default. */
export function placeholderColorOf(node: Pick<DesignNode, "fills">): string {
  const solid = node.fills.find((paint) => paint.type === "solid" && paint.visible);
  return solid?.type === "solid" ? solid.color.toUpperCase() : DEFAULT_PLACEHOLDER_COLOR;
}

/**
 * An image paint showing a placeholder of `color` at the proportions of `size`. Its picture is a
 * document asset whose id derives from both, so every placeholder alike shares one copy; it's
 * stored here when it isn't yet (assets are outside the undo history).
 */
export function addPlaceholderPaint(doc: CanvasDocument, color: string, size: Size): ImagePaint {
  const ratio = size.w > 0 && size.h > 0 ? size.w / size.h : 1;
  const w = Math.max(1, Math.round(ratio >= 1 ? LONG_SIDE : LONG_SIDE * ratio));
  const h = Math.max(1, Math.round(ratio >= 1 ? LONG_SIDE / ratio : LONG_SIDE));
  const hex = color.replace(/^#/, "").toUpperCase();
  const assetId = `${PLACEHOLDER_ASSET_PREFIX}${hex}:${w}x${h}`;
  if (!doc.hasAsset(assetId)) {
    doc.addAsset(assetId, new TextEncoder().encode(placeholderSvg(`#${hex}`, { w, h })));
  }
  return imagePaint(assetId, "fill");
}

/** A layer's fills replaced by a placeholder of its own color and proportions. */
export function placeholderPatch(
  doc: CanvasDocument,
  node: DesignNode,
  color = placeholderColorOf(node),
): ElementPatch<DesignNode> {
  return { fills: [addPlaceholderPaint(doc, color, node)] };
}
