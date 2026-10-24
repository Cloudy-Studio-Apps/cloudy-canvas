import { useEffect } from "react";

import type { FrameElement } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { previewImagesOf } from "./preview-images";
import type { PreviewSize } from "./preview.types";
import { pictureSide } from "./preview-size";

/** Draws these pages ahead (the spreads around the one shown), so a turn shows them at once. */
export function usePrefetchPages(frames: readonly FrameElement[], size: PreviewSize): void {
  const images = previewImagesOf(useDesignEngine());
  const side = pictureSide(size);
  useEffect(() => {
    // A failed page shows its own error when it's turned to.
    for (const frame of frames) images.load(frame, side).catch(() => undefined);
  }, [images, frames, side]);
}
