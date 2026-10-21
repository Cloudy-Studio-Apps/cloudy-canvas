import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

import { CanvasEngine, type CanvasTheme, type EngineState } from "@engine";
import { resolveCssColor } from "@ui/lib/css-color";

function readCanvasTheme(): CanvasTheme {
  return {
    background: resolveCssColor("--canvas-background", 0xfafafa),
    grid: resolveCssColor("--canvas-grid", 0xd4d7dc),
    selection: resolveCssColor("--canvas-selection", 0x4c9be0),
  };
}

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

export function useEngineState(engine: CanvasEngine): EngineState {
  return useSyncExternalStore(engine.subscribe, engine.getState);
}
