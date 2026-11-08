import { useCallback, useEffect, useRef, useState } from "react";

import type { PlayerHints } from "./use-hints.types";

/** How long a missed click shows the hotspots. */
const FLASH_MS = 700;

/** The hotspots' outlines: kept on by the button, or flashed by a missed click when `enabled`. */
export function useHints(enabled: boolean): PlayerHints {
  const [pinned, setPinned] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggle = useCallback(() => setPinned((now) => !now), []);
  const flash = useCallback(() => {
    if (!enabled) return;
    setFlashing(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlashing(false), FLASH_MS);
  }, [enabled]);
  return { shown: pinned || flashing, pinned, toggle, flash };
}
