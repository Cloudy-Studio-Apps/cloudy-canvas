import { useEffect } from "react";

/**
 * While the preview is open: Esc closes it, ← and → turn. The canvas's shortcuts wait meanwhile
 * (the keys are taken before they reach it).
 */
export function usePreviewKeys(open: boolean, turn: (by: -1 | 1) => void, close: () => void): void {
  useEffect(() => {
    if (!open) return;
    const actions: Record<string, () => void> = {
      Escape: close,
      ArrowLeft: () => turn(-1),
      ArrowRight: () => turn(1),
    };
    const onKey = (event: KeyboardEvent) => {
      const run = actions[event.key];
      if (!run) return;
      event.preventDefault();
      event.stopPropagation();
      run();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, turn, close]);
}
