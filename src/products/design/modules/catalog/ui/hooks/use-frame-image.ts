import { useEffect, useState } from "react";

import type { FrameElement } from "../../../frame";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { previewImagesOf } from "../preview/preview-images";

/**
 * A picture of a page frame at most `maxSide` pixels a side, `null` while it's drawn; pictures
 * drawn already (`previewImagesOf`) show at once.
 */
export function useFrameImage(frame: FrameElement | undefined, maxSide: number): string | null {
  const images = previewImagesOf(useDesignEngine());
  const known = frame ? images.known(frame, maxSide) : null;
  const [drawn, setDrawn] = useState<{ frame: FrameElement; url: string } | null>(null);

  useEffect(() => {
    if (!frame || known) return;
    let current = true;
    images
      .load(frame, maxSide)
      .then((url) => current && setDrawn({ frame, url }))
      .catch((error: unknown) => notifyError("The page couldn't be drawn", error));
    return () => {
      current = false;
    };
  }, [images, frame, maxSide, known]);

  return known ?? (drawn && drawn.frame === frame ? drawn.url : null);
}
