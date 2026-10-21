import { Graphics } from "pixi.js";

import type { Camera } from "../../camera";
import type { ElementHandle } from "../../elements";
import type { OverlayState } from "../overlay-state.types";

/** Handle size in screen px. */
const HANDLE_PX = 8;
/** Radius of `dot` handles in screen px. */
const DOT_PX = 4;
const HANDLE_FILL = 0xffffff;
/** Half the length of the "+" on `add` handles, in screen px. */
const PLUS_PX = 5;

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
    for (const rect of state.part) {
      const r = camera.worldRectToScreen(rect);
      this.rect(r.x, r.y, r.w, r.h).fill({ color, alpha: 0.08 }).stroke({ color, width: 2 });
    }
    if (state.selectionBounds) {
      const r = camera.worldRectToScreen(state.selectionBounds, 6);
      this.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1, alpha: 0.7 });
    }
    for (const handle of state.handles) {
      if (handle.look === "dot") {
        const { x, y } = camera.worldToScreen(handle);
        this.circle(x, y, DOT_PX).fill({ color });
      } else if (handle.look === "bar" || handle.look === "add") {
        this.drawStrip(camera, handle, color);
      }
    }
    const squares = [
      ...state.handles.filter((h) => h.look === undefined || h.look === "square"),
      ...state.resizeHandles,
    ];
    for (const point of squares) {
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

  /** A `bar` (filled pill) or `add` (light strip with a "+") handle covering its rect. */
  private drawStrip(camera: Camera, handle: ElementHandle, color: number): void {
    const r = camera.worldRectToScreen({
      x: handle.x,
      y: handle.y,
      w: handle.w ?? 0,
      h: handle.h ?? 0,
    });
    const radius = Math.min(4, r.w / 2, r.h / 2);
    if (handle.look === "bar") {
      this.roundRect(r.x, r.y, r.w, r.h, radius).fill({ color });
      return;
    }
    this.roundRect(r.x, r.y, r.w, r.h, radius).fill({ color, alpha: 0.22 });
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    this.moveTo(cx - PLUS_PX, cy)
      .lineTo(cx + PLUS_PX, cy)
      .moveTo(cx, cy - PLUS_PX)
      .lineTo(cx, cy + PLUS_PX)
      .stroke({ color, width: 1.5 });
  }
}
