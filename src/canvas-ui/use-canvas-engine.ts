import { useEffect, useState, type RefObject } from "react";

import { CanvasEngine, type CanvasDocument, type CanvasProduct } from "@canvas";
import { clipboard } from "@platform";
import { readCanvasTheme } from "./canvas-theme";

/**
 * Creates a CanvasEngine for `product` editing `document`, mounted into the container while both
 * exist, with the system clipboard for copy and paste. The document stays owned by the caller.
 */
export function useCanvasEngine<O extends object>(
  containerRef: RefObject<HTMLElement | null>,
  product: CanvasProduct<O>,
  document: CanvasDocument | null,
): CanvasEngine<O> | null {
  const [engine, setEngine] = useState<CanvasEngine<O> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !document) return;

    const instance = new CanvasEngine({
      product,
      theme: readCanvasTheme(container),
      document,
      clipboard,
    });
    let active = true;
    instance
      .mount(container)
      .then(() => {
        if (active) setEngine(instance);
      })
      .catch((error: unknown) =>
        console.error(`[${product.id}] Failed to start the canvas engine:`, error),
      );

    return () => {
      active = false;
      // Its close tasks (e.g. a thumbnail) still run, then it's destroyed.
      void instance.close();
      setEngine(null);
    };
  }, [containerRef, product, document]);

  return engine;
}
