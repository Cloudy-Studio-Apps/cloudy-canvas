import { useEffect, useState } from "react";

import { useEngine, useEngineState } from "../../engine-context";

/**
 * A number that changes whenever the rulers need drawing again: the view moved or resized, the
 * document changed (the selection may have moved) or the selection changed. Coalesced to one
 * change per frame.
 */
export function useRulerVersion(): number {
  const engine = useEngine();
  const selected = useEngineState((state) => state.selectedIds);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let frame = 0;
    const bump = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setVersion((v) => v + 1);
      });
    };
    const stop = engine.onViewChange(bump);
    bump();
    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
    // A new selection draws its extent.
  }, [engine, selected]);

  return version;
}
