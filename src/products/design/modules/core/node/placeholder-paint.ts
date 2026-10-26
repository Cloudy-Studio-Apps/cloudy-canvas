import type { Paint } from "./paint.types";

/** Placeholder pictures' asset ids start with this, which is how they're told from real ones. */
export const PLACEHOLDER_ASSET_PREFIX = "placeholder:";

/** Whether an asset is a placeholder picture. */
export function isPlaceholderAsset(assetId: string): boolean {
  return assetId.startsWith(PLACEHOLDER_ASSET_PREFIX);
}

/** Whether a paint shows a placeholder picture. */
export function isPlaceholderPaint(paint: Paint): boolean {
  return paint.type === "image" && isPlaceholderAsset(paint.assetId);
}
