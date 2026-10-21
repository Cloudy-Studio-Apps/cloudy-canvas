import { isModKey } from "@shared/core";

import type { Camera } from "../camera";
import { clamp, type Disposables } from "../utils";
import { toCanvasPointer } from "./canvas-pointer";

const LINE_HEIGHT_PX = 16;
const PAGE_HEIGHT_PX = 100;
/** Caps one wheel event's zoom so a mouse notch is a gentle step. */
const MAX_ZOOM_DELTA = 30;
const ZOOM_SENSITIVITY = 0.01;

/** Wheel pans; Ctrl/Cmd + wheel (and trackpad pinch, which arrives the same way) zooms at the cursor. */
export function bindWheel(
  disposables: Disposables,
  canvas: HTMLCanvasElement,
  camera: Camera,
  onChange: () => void,
): void {
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const scale =
      event.deltaMode === 1 ? LINE_HEIGHT_PX : event.deltaMode === 2 ? PAGE_HEIGHT_PX : 1;
    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;
    if (isModKey(event)) {
      const factor = Math.exp(-clamp(dy, -MAX_ZOOM_DELTA, MAX_ZOOM_DELTA) * ZOOM_SENSITIVITY);
      camera.zoomAt(toCanvasPointer(event, canvas, camera).screen, camera.zoom * factor);
    } else if (event.shiftKey && dx === 0) {
      camera.panBy(-dy, 0);
    } else {
      camera.panBy(-dx, -dy);
    }
    onChange();
  };
  disposables.listen(canvas, "wheel", handleWheel, { passive: false });
}
