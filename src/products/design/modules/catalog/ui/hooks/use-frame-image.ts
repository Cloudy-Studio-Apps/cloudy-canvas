import { useEffect, useState } from "react";

import { drawFrame, type FrameElement } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";

/** The workspace the preview draws in, so the user's page never changes. */
const WORKSPACE = "catalog:preview";

/** A picture of a page frame at most `maxSide` pixels a side, `null` while it's drawn. */
export function useFrameImage(frame: FrameElement | undefined, maxSide: number): string | null {
  const engine = useDesignEngine();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!frame) return;
    let current = true;
    let made: string | null = null;
    drawFrame(engine.workspace(WORKSPACE), frame, { maxSide })
      .then((file) => {
        if (!current) return;
        made = URL.createObjectURL(file);
        setUrl(made);
      })
      .catch((error: unknown) => notifyError("The page couldn't be drawn", error));
    return () => {
      current = false;
      setUrl(null);
      if (made) URL.revokeObjectURL(made);
    };
  }, [engine, frame, maxSide]);

  return url;
}
