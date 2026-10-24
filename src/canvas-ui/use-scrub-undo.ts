import { useContext, useEffect, useMemo, useRef } from "react";

import { EngineContext } from "./engine-context";
import type { ScrubUndo } from "./use-scrub-undo.types";

/**
 * What a `NumberInput` gives `onScrubStart`/`onScrubEnd` so a drag of its prefix is one undo step
 * of the engine's document, whatever its `onChange` does with each step (checkpoints included).
 * Outside an editor it does nothing.
 */
export function useScrubUndo(): ScrubUndo {
  const engine = useContext(EngineContext);
  const release = useRef<(() => void) | null>(null);
  // A field removed mid-drag (the selection changed) still ends its step.
  useEffect(() => () => release.current?.(), []);
  return useMemo(
    () => ({
      onScrubStart: () => {
        release.current?.();
        release.current = engine?.doc.holdCheckpoints() ?? null;
      },
      onScrubEnd: () => {
        release.current?.();
        release.current = null;
      },
    }),
    [engine],
  );
}
