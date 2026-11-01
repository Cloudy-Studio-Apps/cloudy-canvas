import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { MOVE_THRESHOLD_PX } from "@canvas";
import { edgeScrollStep } from "./edge-scroll";
import type { RowDrag, RowDragOptions, RowDragState, RowDropTarget } from "./row-drag.types";
import { rowDropTarget } from "./row-drop-target";

/** What a press doesn't start a drag from. `ListRow` is a `div`, so its row still drags. */
const NOT_A_GRIP =
  "button, a, input, textarea, select, [role='checkbox'], [role='menuitem'], [data-row-drag-ignore]";

/**
 * Dragging rows to reorder a list with pointer events, never HTML5 `draggable`: Tauri's file drop
 * handler keeps those drags from the page on Windows and macOS. A press past `MOVE_THRESHOLD_PX`
 * drags, the list scrolls at its edges, Esc cancels, and the click that ends a drag is swallowed.
 */
export function useRowDrag(options: RowDragOptions): RowDrag {
  const scope = useId();
  const [drag, setDrag] = useState<RowDragState | null>(null);
  // The latest options, read by the listeners of a drag that outlives renders.
  const latest = useRef(options);
  const stopActive = useRef<(() => void) | null>(null);
  useEffect(() => {
    latest.current = options;
  });
  useEffect(() => () => stopActive.current?.(), []);

  const press = useCallback(
    (event: ReactPointerEvent<HTMLElement>, id: string) => {
      if (event.button !== 0 || (event.target as Element).closest(NOT_A_GRIP)) return;
      const start = { x: event.clientX, y: event.clientY };
      const scroller = scrollParentOf(event.currentTarget);
      const root = document.documentElement.style;
      const previous = { userSelect: root.userSelect, cursor: root.cursor };
      let pointer = start;
      let dragging = false;
      let frame = 0;
      let over: RowDropTarget | null = null;

      const accepts = (overId: string) =>
        overId !== id && (latest.current.canDrop?.(id, overId) ?? true);
      const update = () => {
        over = rowDropTarget(pointer, scope, accepts);
        setDrag({ id, overId: over?.id ?? null, side: over?.side ?? "before", pointer });
      };

      const autoScroll = () => {
        frame = requestAnimationFrame(autoScroll);
        if (!scroller) return;
        const step = edgeScrollStep(pointer.y, scroller.getBoundingClientRect());
        if (step === 0) return;
        const before = scroller.scrollTop;
        scroller.scrollTop += step;
        if (scroller.scrollTop !== before) update();
      };

      const move = (e: PointerEvent) => {
        pointer = { x: e.clientX, y: e.clientY };
        if (!dragging) {
          if (Math.hypot(pointer.x - start.x, pointer.y - start.y) < MOVE_THRESHOLD_PX) return;
          dragging = true;
          root.userSelect = "none";
          root.cursor = "grabbing";
          frame = requestAnimationFrame(autoScroll);
        }
        update();
      };

      const finish = (drop: boolean) => {
        stop();
        if (!dragging) return;
        // The click that ends a drag doesn't reach the row under it.
        const swallow = (e: MouseEvent) => e.stopPropagation();
        window.addEventListener("click", swallow, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }));
        if (drop && over) latest.current.onDrop(id, over.id, over.side);
      };

      const up = () => finish(true);
      const cancel = () => finish(false);
      const key = (e: KeyboardEvent) => {
        if (e.key !== "Escape" || !dragging) return;
        e.preventDefault();
        e.stopPropagation();
        cancel();
      };

      const stop = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
        window.removeEventListener("keydown", key, { capture: true });
        if (dragging) Object.assign(root, previous);
        stopActive.current = null;
        setDrag(null);
      };

      stopActive.current?.();
      stopActive.current = stop;
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
      window.addEventListener("keydown", key, { capture: true });
    },
    [scope],
  );

  return {
    drag,
    grabProps: (id, enabled = true) => ({
      onPointerDown: (event) => {
        if (enabled) press(event, id);
      },
    }),
    dropProps: (id) => ({ "data-row-drop": id, "data-row-drop-scope": scope }),
  };
}

/** The nearest ancestor that scrolls, for scrolling a list at its edges. */
function scrollParentOf(element: HTMLElement): HTMLElement | null {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent;
  }
  return null;
}
