import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { MOVE_THRESHOLD_PX, type Point } from "@canvas";
import { useDesignEngine } from "../design-engine-context";
import type {
  CanvasDragState,
  DropOnCanvas,
  DropOnCanvasOptions,
} from "./use-drop-on-canvas.types";

/**
 * Dragging a row (any `payload`) out of a panel onto the canvas, with pointer events like `useRowDrag` (never
 * HTML5 `draggable`): a press past `MOVE_THRESHOLD_PX` drags, the page under the pointer is
 * `targetAt` it (any point of the canvas when there is no `targetAt`), a release over one drops there, Esc cancels, and the click ending a drag is
 * swallowed.
 */
export function useDropOnCanvas<P, T = Point>(options: DropOnCanvasOptions<P, T>): DropOnCanvas<P> {
  const engine = useDesignEngine();
  const [drag, setDrag] = useState<CanvasDragState<P> | null>(null);
  const latest = useRef(options);
  const stopActive = useRef<(() => void) | null>(null);
  useEffect(() => {
    latest.current = options;
  });
  useEffect(() => () => stopActive.current?.(), []);

  const press = useCallback(
    (event: ReactPointerEvent<HTMLElement>, payload: P) => {
      if (event.button !== 0) return;
      const start = { x: event.clientX, y: event.clientY };
      const root = document.documentElement.style;
      const previous = { userSelect: root.userSelect, cursor: root.cursor };
      let dragging = false;
      let world: Point | null = null;

      const targetAt = (pointer: Point): T | null => {
        world = engine.clientToWorld(pointer);
        if (!world) return null;
        const { targetAt: hit } = latest.current;
        // Without a hit test the target is the world point (`T` is `Point`).
        return hit ? hit(world) : (world as unknown as T);
      };
      const move = (e: PointerEvent) => {
        const pointer = { x: e.clientX, y: e.clientY };
        if (!dragging) {
          if (Math.hypot(pointer.x - start.x, pointer.y - start.y) < MOVE_THRESHOLD_PX) return;
          dragging = true;
          root.userSelect = "none";
          root.cursor = "grabbing";
        }
        setDrag({ payload, pointer, over: targetAt(pointer) !== null });
      };
      const finish = (e: PointerEvent | null) => {
        stop();
        if (!dragging) return;
        const swallow = (click: MouseEvent) => click.stopPropagation();
        window.addEventListener("click", swallow, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }));
        if (!e) return;
        const target = targetAt({ x: e.clientX, y: e.clientY });
        if (target && world) latest.current.onDrop(payload, target, world);
      };
      const up = (e: PointerEvent) => finish(e);
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

  return {
    drag,
    grabProps: (payload) => ({ onPointerDown: (event) => press(event, payload) }),
  };
}
