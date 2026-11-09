import type { Camera } from "../camera";
import type { Disposables } from "../utils";
import type { WebKitGestureEvent } from "./pinch-input.types";

/**
 * A trackpad pinch zooms at the pointer on macOS, where WebKit sends gesture events and not the
 * Ctrl + wheel `bindWheel` reads. Other webviews never fire these.
 */
export function bindPinch(
  disposables: Disposables,
  canvas: HTMLCanvasElement,
  camera: Camera,
  onChange: () => void,
): void {
  let startZoom = camera.zoom;
  const start = (event: Event) => {
    event.preventDefault();
    startZoom = camera.zoom;
  };
  const change = (event: Event) => {
    event.preventDefault();
    const { clientX, clientY, scale } = event as WebKitGestureEvent;
    const box = canvas.getBoundingClientRect();
    camera.zoomAt({ x: clientX - box.left, y: clientY - box.top }, startZoom * scale);
    onChange();
  };
  const end = (event: Event) => event.preventDefault();
  // Not in the DOM's event types, hence the cast (`disposables.listen` may gate them).
  const listen = (type: string, handler: (event: Event) => void) =>
    disposables.listen(canvas, type as keyof HTMLElementEventMap, handler, { passive: false });
  listen("gesturestart", start);
  listen("gesturechange", change);
  listen("gestureend", end);
}
