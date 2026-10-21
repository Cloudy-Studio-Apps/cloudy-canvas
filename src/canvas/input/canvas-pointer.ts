import { isModKey } from "@shared/core";

import type { Camera } from "../camera";
import type { CanvasPointer } from "../tools";

/** Converts a DOM pointer/mouse event into canvas screen + world coordinates. */
export function toCanvasPointer(
  event: PointerEvent | MouseEvent,
  canvas: HTMLCanvasElement,
  camera: Camera,
): CanvasPointer {
  const rect = canvas.getBoundingClientRect();
  const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  return {
    screen,
    world: camera.screenToWorld(screen),
    shiftKey: event.shiftKey,
    modKey: isModKey(event),
    altKey: event.altKey,
  };
}
