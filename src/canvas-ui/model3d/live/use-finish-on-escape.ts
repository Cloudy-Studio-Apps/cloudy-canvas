import { useEffect } from "react";

/**
 * Esc finishes the live edit, and only that: it's caught before the canvas and its mode see it.
 * Typing in a field (a panel's) keeps its keys.
 */
export function useFinishOnEscape(onFinish: () => void): void {
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      event.stopPropagation();
      onFinish();
    };
    window.addEventListener("keydown", keyDown, { capture: true });
    return () => window.removeEventListener("keydown", keyDown, { capture: true });
  }, [onFinish]);
}
