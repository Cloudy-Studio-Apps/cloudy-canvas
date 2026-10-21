import { useEffect, useState, type RefObject } from "react";

import { CanvasEngine } from "@engine";
import { readCanvasTheme } from "./canvas-theme";

/** Creates a CanvasEngine mounted into the container for the component's lifetime. */
export function useCanvasEngine(containerRef: RefObject<HTMLElement | null>): CanvasEngine | null {
  const [engine, setEngine] = useState<CanvasEngine | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = new CanvasEngine({ theme: readCanvasTheme() });
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
  }, [containerRef]);

  return engine;
}
