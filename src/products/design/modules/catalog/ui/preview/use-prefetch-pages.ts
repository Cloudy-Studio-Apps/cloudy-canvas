import { useEffect } from "react";

import type { FrameElement } from "../../../frame";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { previewImagesOf } from "./preview-images";
import { pictureSide } from "./preview-size";

/**
 * Draws these frames' pictures ahead at the preview's `scale` (the spreads around the one shown),
 * so a turn shows them at once.
 */
export function usePrefetchPages(frames: readonly FrameElement[], scale: number): void {
  const images = previewImagesOf(useDesignEngine());
  useEffect(() => {
    // A failed page shows its own error when it's turned to.
    for (const frame of frames)
      images.load(frame, pictureSide(frame, scale)).catch(() => undefined);
  }, [images, frames, scale]);
}
