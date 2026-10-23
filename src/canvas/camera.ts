import type { FitOptions } from "./camera.types";
import type { Point, Rect, Size } from "./geometry.types";
import { clamp } from "./utils";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;
const FIT_PADDING = 80;

/**
 * Maps world coordinates to screen (viewport) pixels: screen = (world + offset) * zoom.
 * `x`/`y` are the world coordinates shown at the viewport's top-left corner, negated.
 */
export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  /** Viewport size in screen pixels. */
  viewport: Size = { w: 0, h: 0 };
  private minZoom = MIN_ZOOM;
  private maxZoom = MAX_ZOOM;

  /** The zoom range (the product's, see `CanvasViewOptions`). */
  setZoomLimits(min: number, max: number): void {
    this.minZoom = min;
    this.maxZoom = max;
    this.zoom = this.clampZoom(this.zoom);
  }

  setViewport(w: number, h: number): void {
    this.viewport = { w, h };
  }

  screenToWorld(p: Point): Point {
    return { x: p.x / this.zoom - this.x, y: p.y / this.zoom - this.y };
  }

  worldToScreen(p: Point): Point {
    return { x: (p.x + this.x) * this.zoom, y: (p.y + this.y) * this.zoom };
  }

  /** World rect to screen pixels, grown by `padding` screen px on every side. */
  worldRectToScreen(r: Rect, padding = 0): Rect {
    const { x, y } = this.worldToScreen(r);
    return {
      x: x - padding,
      y: y - padding,
      w: r.w * this.zoom + padding * 2,
      h: r.h * this.zoom + padding * 2,
    };
  }

  /** Pans by a screen-space delta. */
  panBy(dx: number, dy: number): void {
    this.x += dx / this.zoom;
    this.y += dy / this.zoom;
  }

  /** Zooms keeping the world point under `screenPoint` fixed. */
  zoomAt(screenPoint: Point, nextZoom: number): void {
    const before = this.screenToWorld(screenPoint);
    this.zoom = this.clampZoom(nextZoom);
    const after = this.screenToWorld(screenPoint);
    this.x += after.x - before.x;
    this.y += after.y - before.y;
  }

  zoomAtCenter(nextZoom: number): void {
    this.zoomAt({ x: this.viewport.w / 2, y: this.viewport.h / 2 }, nextZoom);
  }

  /** Centers `worldPoint` in the viewport. */
  centerOn(worldPoint: Point): void {
    this.x = this.viewport.w / 2 / this.zoom - worldPoint.x;
    this.y = this.viewport.h / 2 / this.zoom - worldPoint.y;
  }

  /** Fits `rect` in the viewport, without zooming past 100% unless `maxZoom` says otherwise. */
  fitRect(rect: Rect, { padding = FIT_PADDING, maxZoom = 1 }: FitOptions = {}): void {
    const zx = (this.viewport.w - padding * 2) / Math.max(rect.w, 1);
    const zy = (this.viewport.h - padding * 2) / Math.max(rect.h, 1);
    this.zoom = this.clampZoom(Math.min(zx, zy, maxZoom));
    this.centerOn({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });
  }

  /** 100% zoom with the world origin centered. */
  reset(): void {
    this.zoom = 1;
    this.centerOn({ x: 0, y: 0 });
  }

  private clampZoom(zoom: number): number {
    return clamp(zoom, this.minZoom, this.maxZoom);
  }

  visibleWorldRect(): Rect {
    return {
      x: -this.x,
      y: -this.y,
      w: this.viewport.w / this.zoom,
      h: this.viewport.h / this.zoom,
    };
  }
}
