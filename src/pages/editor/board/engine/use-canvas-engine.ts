import { useEffect, useState, type RefObject } from "react";

import { CanvasEngine, type BoardDocument } from "@engine";
import { readCanvasTheme } from "./canvas-theme";

/**
 * Creates a CanvasEngine editing `document`, mounted into the container while both exist.
 * The document stays owned by the caller.
 */
export function useCanvasEngine(
  containerRef: RefObject<HTMLElement | null>,
  document: BoardDocument | null,
): CanvasEngine | null {
  const [engine, setEngine] = useState<CanvasEngine | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !document) return;

    const instance = new CanvasEngine({ theme: readCanvasTheme(), document });
    let active = true;
    instance
      .mount(container)
      .then(() => {
        if (active) setEngine(instance);
      })
      .catch((error: unknown) =>
        console.error("[board] Failed to start the canvas engine:", error),
      );

    return () => {
      active = false;
      instance.destroy();
      setEngine(null);
    };
  }, [containerRef, document]);

  return engine;
}
