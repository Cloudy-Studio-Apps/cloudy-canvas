import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { useVariablesWindowStore } from "./variables-window-store";

/**
 * Drags the Variables window by its title bar: returns the handler for the bar's pointer down.
 * The position is kept in the window's store for the session (`null`: centered).
 */
export function useDragPanel(panel: React.RefObject<HTMLDivElement | null>) {
  const setPosition = useVariablesWindowStore((state) => state.setPosition);
  const start = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  return useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
      const box = panel.current?.getBoundingClientRect();
      const parent = panel.current?.offsetParent?.getBoundingClientRect();
      if (!box || !parent) return;
      start.current = {
        x: event.clientX,
        y: event.clientY,
        left: box.left - parent.left,
        top: box.top - parent.top,
      };
      const bar = event.currentTarget;
      bar.setPointerCapture(event.pointerId);
      const move = (e: PointerEvent) => {
        const from = start.current;
        if (!from) return;
        const maxLeft = parent.width - 120;
        const maxTop = parent.height - 40;
        setPosition({
          left: Math.min(maxLeft, Math.max(-box.width + 120, from.left + e.clientX - from.x)),
          top: Math.min(maxTop, Math.max(0, from.top + e.clientY - from.y)),
        });
      };
      const end = () => {
        start.current = null;
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", end);
        bar.removeEventListener("pointercancel", end);
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", end);
      bar.addEventListener("pointercancel", end);
    },
    [panel, setPosition],
  );
}
