import { useCallback, useRef, useSyncExternalStore } from "react";

import type { ImageQuality } from "@canvas";
import { useEngine } from "./engine-context";

function sameQuality(a: ImageQuality | null, b: ImageQuality | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.natural.w === b.natural.w &&
    a.natural.h === b.natural.h &&
    a.shown?.w === b.shown?.w &&
    a.shown?.h === b.shown?.h &&
    a.vector === b.vector &&
    a.onScreen === b.onScreen
  );
}

/**
 * How sharp the canvas shows a picture now (`engine.imageQuality`), re-read as its texture
 * changes or it's zoomed; `null` without one or before its size is known.
 */
export function useImageQuality(assetId: string | null): ImageQuality | null {
  const engine = useEngine();
  const last = useRef<ImageQuality | null>(null);
  const read = useCallback(() => {
    const next = assetId ? engine.imageQuality(assetId) : null;
    if (!sameQuality(last.current, next)) last.current = next;
    return last.current;
  }, [engine, assetId]);
  return useSyncExternalStore((listener) => engine.onImagesChange(listener), read);
}
