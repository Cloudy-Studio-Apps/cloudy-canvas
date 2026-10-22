import type { SnapSettings } from "@canvas";
import { useSnappingStore } from "@shared/stores/snapping-store";
import { useEngine, useEngineState } from "./engine-context";

/**
 * The open canvas's snap settings, and a setter that changes them and remembers the choice for
 * every canvas of the product.
 */
export function useSnapping(): [SnapSettings, (patch: Partial<SnapSettings>) => void] {
  const engine = useEngine();
  const snapping = useEngineState((state) => state.snapping);
  const save = useSnappingStore((state) => state.save);
  return [
    snapping,
    (patch) => {
      engine.setSnapping(patch);
      save(engine.productId, patch);
    },
  ];
}
