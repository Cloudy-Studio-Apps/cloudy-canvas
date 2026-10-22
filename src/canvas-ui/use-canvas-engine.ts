import { useEffect, useState, type RefObject } from "react";

import { CanvasEngine, type CanvasDocument, type CanvasProduct, type EngineLoading } from "@canvas";
import { clipboard, fontLibrary } from "@platform";
import { useSnappingStore } from "@shared/stores/snapping-store";
import { readCanvasTheme } from "./canvas-theme";
import type { CanvasEngineHost } from "./use-canvas-engine.types";

/**
 * Creates a CanvasEngine for `product` editing `document`, mounted into the container while both
 * exist, with the system clipboard for copy and paste, the app's fonts and the user's snapping. The document stays owned
 * by the caller. The engine is handed out once it has mounted; until then `loading` says what it's
 * doing (for `CanvasLoadingOverlay`).
 */
export function useCanvasEngine<O extends object>(
  containerRef: RefObject<HTMLElement | null>,
  product: CanvasProduct<O>,
  document: CanvasDocument | null,
): CanvasEngineHost<O> {
  const [engine, setEngine] = useState<CanvasEngine<O> | null>(null);
  const [loading, setLoading] = useState<EngineLoading | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !document) return;

    const instance = new CanvasEngine({
      product,
      theme: readCanvasTheme(container),
      document,
      clipboard,
      fonts: fontLibrary,
    });
    instance.setSnapping(useSnappingStore.getState().byProduct[product.id] ?? {});
    let active = true;
    instance
      .mount(container, (next) => {
        if (active) setLoading(next);
      })
      .then(() => {
        if (!active) return;
        setEngine(instance);
        setLoading(null);
      })
      .catch((error: unknown) => {
        console.error(`[${product.id}] Failed to start the canvas engine:`, error);
        if (active) setLoading(null);
      });

    return () => {
      active = false;
      // Its close tasks (e.g. a thumbnail) still run, then it's destroyed.
      void instance.close();
      setEngine(null);
      setLoading(null);
    };
  }, [containerRef, product, document]);

  return { engine, loading };
}
