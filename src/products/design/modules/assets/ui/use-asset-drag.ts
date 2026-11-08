import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

import { MOVE_THRESHOLD_PX, type Point } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { AssetDrag, AssetDragState, AssetRef } from "./assets-ui.types";

/**
 * Dragging a picture out of the tab onto the canvas, with pointer events (never HTML5
 * `draggable`): a press past `MOVE_THRESHOLD_PX` drags, a release over the canvas drops at that
 * world point (`engine.clientToWorld`), Esc cancels, and the click ending a drag is swallowed.
 */
export function useAssetDrag(onDrop: (ref: AssetRef, world: Point) => void): AssetDrag {
  const engine = useDesignEngine();
  const [drag, setDrag] = useState<AssetDragState | null>(null);
  const latest = useRef(onDrop);
  const stopActive = useRef<(() => void) | null>(null);
  useEffect(() => {
    latest.current = onDrop;
  });
  useEffect(() => () => stopActive.current?.(), []);

  const press = useCallback(
    (event: PointerEvent<HTMLElement>, ref: AssetRef) => {
      if (event.button !== 0) return;
      const start = { x: event.clientX, y: event.clientY };
      const root = document.documentElement.style;
      const previous = { userSelect: root.userSelect, cursor: root.cursor };
      let dragging = false;

      const move = (e: globalThis.PointerEvent) => {
        const pointer = { x: e.clientX, y: e.clientY };
        if (!dragging) {
          if (Math.hypot(pointer.x - start.x, pointer.y - start.y) < MOVE_THRESHOLD_PX) return;
          dragging = true;
          root.userSelect = "none";
          root.cursor = "grabbing";
        }
        setDrag({ ref, pointer, over: engine.clientToWorld(pointer) !== null });
      };
      const finish = (e: globalThis.PointerEvent | null) => {
        stop();
        if (!dragging) return;
        const swallow = (click: MouseEvent) => click.stopPropagation();
        window.addEventListener("click", swallow, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }));
        const world = e && engine.clientToWorld({ x: e.clientX, y: e.clientY });
        if (world) latest.current(ref, world);
      };
      const up = (e: globalThis.PointerEvent) => finish(e);
      const cancel = () => finish(null);
      const key = (e: KeyboardEvent) => {
        if (e.key !== "Escape" || !dragging) return;
        e.preventDefault();
        e.stopPropagation();
        cancel();
      };
      const stop = () => {
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
    [engine],
  );

  return { drag, press };
}
