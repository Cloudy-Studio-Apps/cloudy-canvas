import { Graphics } from "pixi.js";

import type { Camera } from "../../camera";
import type { ElementHandle } from "../../elements";
import type { Point } from "../../geometry.types";
import { rotatedCorners } from "../../rotation";
import type { Outline, OverlayState } from "../overlay-state.types";

/** Handle size in screen px. */
const HANDLE_PX = 8;
/** Radius of `dot` handles in screen px. */
const DOT_PX = 4;
const HANDLE_FILL = 0xffffff;
/** Half the length of the "+" on `add` handles, in screen px. */
const PLUS_PX = 5;
/** Dashes of mask outlines, in screen px. */
const DASH_PX = 4;
const GAP_PX = 3;

/** Hover, selection and marquee outlines, drawn in screen space so line widths stay constant. */
export class OverlayLayer extends Graphics {
  draw(camera: Camera, state: OverlayState, color: number): void {
    this.clear();
    for (const outline of state.masks) {
      this.dashed(this.corners(camera, outline)).stroke({ color, width: 1, alpha: 0.9 });
    }
    if (state.hover) {
      this.outline(camera, state.hover).stroke({ color, width: 1.5, alpha: 0.6 });
    }
    for (const outline of state.selection) {
      this.outline(camera, outline).stroke({ color, width: 1.5 });
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

  /** Traces an element's outline: a rect padded 2px, or the turned rect's corners. */
  private outline(camera: Camera, { rect, rotation }: Outline): this {
    if (!rotation) {
      const r = camera.worldRectToScreen(rect, 2);
      return this.rect(r.x, r.y, r.w, r.h);
    }
    const corners = rotatedCorners(rect, rotation).map((p) => camera.worldToScreen(p));
    return this.poly(corners.flatMap((p) => [p.x, p.y]));
  }

  /** An outline's corners on screen, padded 2px when it isn't turned (as `outline` draws it). */
  private corners(camera: Camera, { rect, rotation }: Outline): Point[] {
    if (!rotation) {
      const r = camera.worldRectToScreen(rect, 2);
      return [
        { x: r.x, y: r.y },
        { x: r.x + r.w, y: r.y },
        { x: r.x + r.w, y: r.y + r.h },
        { x: r.x, y: r.y + r.h },
      ];
    }
    return rotatedCorners(rect, rotation).map((p) => camera.worldToScreen(p));
  }

  /** Traces a closed polygon as dashes (the caller strokes them). */
  private dashed(points: readonly Point[]): this {
    points.forEach((from, i) => {
      const to = points[(i + 1) % points.length]!;
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      if (length === 0) return;
      const ux = (to.x - from.x) / length;
      const uy = (to.y - from.y) / length;
      for (let d = 0; d < length; d += DASH_PX + GAP_PX) {
        const end = Math.min(d + DASH_PX, length);
        this.moveTo(from.x + ux * d, from.y + uy * d).lineTo(from.x + ux * end, from.y + uy * end);
      }
    });
    return this;
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
