import { useEffect, useState, type RefObject } from "react";

import { CanvasEngine } from "@canvas";
// From its file, not the barrel: the viewer build must not pull in the editor or the platform.
import { readCanvasTheme } from "@canvas-ui/canvas-theme";
import type { ViewerEngineHost, ViewerEngineOptions } from "./use-viewer-engine.types";

/** The only tool the viewer has: dragging moves around, nothing else happens. */
const HAND = "hand";

/**
 * The read-only engine the viewer draws with: its document takes no edits, whatever picks another
 * tool (its keys) is put back on the hand at once, and whatever selects is undone.
 */
export function useViewerEngine<O extends object>(
  containerRef: RefObject<HTMLElement | null>,
  { product, document, fonts }: ViewerEngineOptions<O>,
): ViewerEngineHost<O> {
  const [host, setHost] = useState<ViewerEngineHost<O>>({ engine: null, failed: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    document.setReadOnly(true);
    const engine = new CanvasEngine({
      product,
      theme: readCanvasTheme(container),
      document,
      fonts,
    });
    let active = true;
    let stopHand = () => {};
    engine
      .mount(container)
      .then(() => {
        if (!active) return;
        engine.setTool(HAND);
        stopHand = engine.subscribe(() => {
          const { tool, selectionCount } = engine.getState();
          if (tool !== HAND) engine.setTool(HAND);
          // Nothing is picked out either (Ctrl+A selects without a tool).
          if (selectionCount > 0) engine.select([]);
        });
        setHost({ engine, failed: false });
      })
      .catch((error: unknown) => {
        console.error("[viewer] The board couldn't be drawn:", error);
        if (active) setHost({ engine: null, failed: true });
      });
    return () => {
      active = false;
      stopHand();
      void engine.close();
    };
  }, [containerRef, product, document, fonts]);

  return host;
}
