import { useCallback, type PointerEvent as ReactPointerEvent } from "react";

import { mod } from "@canvas";
import type { ModelRotation } from "@canvas";

import type { OrbitDragOptions } from "./use-orbit-drag.types";

/** Degrees the model turns per pixel dragged. */
const DEGREES_PER_PX = 0.5;

/** An angle in -180 to 180 degrees. */
function wrap(degrees: number): number {
  return mod(degrees + 180, 360) - 180;
}

/**
 * Turns the model by dragging: across turns it around Y, up and down around X. Returns the
 * `onPointerDown` handler of the view; the pointer is captured until it's released.
 */
export function useOrbitDrag({ angle, onTurn }: OrbitDragOptions) {
  return useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const element = event.currentTarget;
      element.setPointerCapture(event.pointerId);
      const from = { x: event.clientX, y: event.clientY };
      const start: ModelRotation = { ...angle() };
      const move = (e: PointerEvent) => {
        onTurn({
          x: wrap(start.x + (e.clientY - from.y) * DEGREES_PER_PX),
          y: wrap(start.y + (e.clientX - from.x) * DEGREES_PER_PX),
          z: start.z,
        });
      };
      const end = () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", end);
        element.removeEventListener("pointercancel", end);
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", end);
      element.addEventListener("pointercancel", end);
    },
    [angle, onTurn],
  );
}
