import type { CSSProperties } from "react";

import { transformCrop } from "@canvas";
import { DEFAULT_TILE_SCALE, type ImagePaint } from "@design";

/** Where a crop's part sits as a CSS background position (0–100%). */
function position(start: number, size: number): string {
  return size >= 1 ? "0%" : `${(start / (1 - size)) * 100}%`;
}

/**
 * The picker's preview of an image paint as a CSS background: covering, fitted, its cropped part
 * (a turned or mirrored crop shows covering) or tiled. Turns aren't shown.
 */
export function imagePreviewStyle(paint: ImagePaint, url: string): CSSProperties {
  const image = `url("${url}")`;
  const crop =
    paint.scaleMode === "crop" && paint.transform ? transformCrop(paint.transform) : null;
  if (crop) {
    return {
      backgroundImage: image,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${100 / crop.w}% ${100 / crop.h}%`,
      backgroundPosition: `${position(crop.x, crop.w)} ${position(crop.y, crop.h)}`,
    };
  }
  if (paint.scaleMode === "tile") {
    const share = Math.min(100, Math.max(8, (paint.scalingFactor ?? DEFAULT_TILE_SCALE) * 50));
    return { backgroundImage: image, backgroundRepeat: "repeat", backgroundSize: `${share}% auto` };
  }
  return {
    backgroundImage: image,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: paint.scaleMode === "fit" ? "contain" : "cover",
  };
}
