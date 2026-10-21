import { Graphics } from "pixi.js";

import type { Camera } from "../../camera";
import type { OverlayState } from "../overlay-state.types";

/** Handle size in screen px. */
const HANDLE_PX = 8;
const HANDLE_FILL = 0xffffff;

/** Hover, selection and marquee outlines, drawn in screen space so line widths stay constant. */
export class OverlayLayer extends Graphics {
  draw(camera: Camera, state: OverlayState, color: number): void {
    this.clear();
    if (state.hover) {
      const r = camera.worldRectToScreen(state.hover, 2);
      this.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1.5, alpha: 0.6 });
    }
    for (const rect of state.selection) {
      const r = camera.worldRectToScreen(rect, 2);
      this.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1.5 });
    }
    if (state.selectionBounds) {
      const r = camera.worldRectToScreen(state.selectionBounds, 6);
      this.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1, alpha: 0.7 });
    }
    for (const point of state.resizeHandles) {
      const { x, y } = camera.worldToScreen(point);
      const half = HANDLE_PX / 2;
      this.rect(x - half, y - half, HANDLE_PX, HANDLE_PX)
        .fill({ color: HANDLE_FILL })
        .stroke({ color, width: 1.5 });
    }
    if (state.marquee) {
      const r = camera.worldRectToScreen(state.marquee);
      this.rect(r.x, r.y, r.w, r.h).fill({ color, alpha: 0.08 }).stroke({ color, width: 1 });
    }
  }
}
