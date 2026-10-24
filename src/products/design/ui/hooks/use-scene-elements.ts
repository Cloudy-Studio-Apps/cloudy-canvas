import { useCallback, useSyncExternalStore } from "react";

import type { CanvasElement } from "@canvas";
import { useDesignEngine } from "../design-engine-context";

/**
 * The scene's elements (the page on screen, bottom to top), re-read when the document changes:
 * the same array until it does. Changes are heard at most once per frame, so a drag's many small
 * edits re-render the panels once per frame drawn.
 */
export function useSceneElements(): readonly CanvasElement[] {
  const engine = useDesignEngine();
  const subscribe = useCallback(
    (listener: () => void) => {
      let frame = 0;
      const off = engine.onViewChange(() => {
        frame ||= requestAnimationFrame(() => {
          frame = 0;
          listener();
        });
      });
      return () => {
        off();
        cancelAnimationFrame(frame);
      };
    },
    [engine],
  );
  // The scene's list is replaced on every document change and kept otherwise.
  return useSyncExternalStore(subscribe, () => engine.elements());
}
