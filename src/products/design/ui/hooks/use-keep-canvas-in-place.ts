import { useLayoutEffect, useRef } from "react";

import type { PannableEngine } from "./use-keep-canvas-in-place.types";

/**
 * Keeps the content where it is on screen when the canvas's left edge moves (a panel opened or
 * closed, the UI hidden): the camera pans by what the edge moved, before the canvas is resized.
 */
export function useKeepCanvasInPlace(engine: PannableEngine | null, left: number): void {
  const previous = useRef(left);

  useLayoutEffect(() => {
    const moved = previous.current - left;
    previous.current = left;
    if (engine && moved !== 0) engine.panBy(moved, 0);
  }, [engine, left]);
}
