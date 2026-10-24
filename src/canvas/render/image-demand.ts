import type { Point, Size } from "../geometry.types";
import { fitTransform, imageQuad } from "../image";
import type { ImageDemand, ImageUse } from "./image-cache.types";

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * The texture size (pixels on the picture's long side) at which `use` shows one texel per device
 * pixel, when a local unit is `pixelsPerUnit` device pixels. Caches cap it: a raster picture at
 * its own size, an SVG (drawn at any size) at the largest texture they make.
 */
export function imagePixelsNeeded(use: ImageUse, natural: Size, pixelsPerUnit: number): number {
  const long = Math.max(natural.w, natural.h, 1);
  const { box, placement } = use;
  let across: number;
  let down: number;
  if (placement.mode === "tile") {
    // A tile is the picture's own pixel size times the scale.
    across = natural.w * placement.scale;
    down = natural.h * placement.scale;
  } else {
    const transform =
      placement.mode === "transform"
        ? placement.transform
        : fitTransform(placement.mode, box, natural, placement.rotation);
    // The picture's corners in the box's normalized space, then its edges in local units.
    const [a, b, , d] = imageQuad(transform).map((p) => ({ x: p.x * box.w, y: p.y * box.h }));
    across = distance(a!, b!);
    down = distance(a!, d!);
  }
  const needed = Math.max(
    (across * pixelsPerUnit * long) / Math.max(natural.w, 1),
    (down * pixelsPerUnit * long) / Math.max(natural.h, 1),
  );
  return Math.ceil(needed);
}

/**
 * What `uses` ask for at `pixelsPerUnit`, the largest per asset. Uses whose picture's size isn't
 * known yet (`naturalSize` returns `null`) are left out.
 */
export function imageDemands(
  uses: Iterable<ImageUse>,
  naturalSize: (assetId: string) => Size | null,
  pixelsPerUnit: number,
): ImageDemand[] {
  const largest = new Map<string, number>();
  for (const use of uses) {
    const natural = naturalSize(use.assetId);
    if (!natural) continue;
    const pixels = imagePixelsNeeded(use, natural, pixelsPerUnit);
    largest.set(use.assetId, Math.max(largest.get(use.assetId) ?? 0, pixels));
  }
  return [...largest].map(([assetId, pixels]) => ({ assetId, pixels }));
}
