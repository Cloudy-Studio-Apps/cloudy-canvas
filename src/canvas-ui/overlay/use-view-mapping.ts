import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useEngine } from "../engine-context";
import type { ViewMapping } from "./overlay.types";

/** How world points map to the canvas's overlays, re-read when the camera moves. */
export function useViewMapping(): ViewMapping {
  const engine = useEngine();
  const subscribe = useCallback((listener: () => void) => engine.onViewChange(listener), [engine]);
  // A string, so the snapshot only changes when the view does.
  const key = useSyncExternalStore(subscribe, () => {
    const unit = engine.worldRectToScreen({ x: 0, y: 0, w: 1, h: 1 });
    return `${unit.x},${unit.y},${unit.w}`;
  });
  return useMemo(() => {
    const [x = 0, y = 0, zoom = 1] = key.split(",").map(Number);
    return { origin: { x, y }, zoom };
  }, [key]);
}
