import { Application, Container, Graphics } from "pixi.js";

import type { Camera } from "../camera";
import type { Shape } from "../document";
import type { Rect } from "../geometry";
import { strokeOutline } from "./stroke-outline";
import { ShapeView } from "./shape-views";

/** Colors the host app provides (resolved from its theme tokens) as 0xRRGGBB numbers. */
export interface CanvasTheme {
  background: number;
  grid: number;
  selection: number;
}

const GRID_SPACING = 24;
const MIN_GRID_SCREEN_SPACING = 14;

export interface OverlayState {
  selection: Rect[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Rect | null;
  marquee: Rect | null;
}

/** Owns the Pixi application and turns document + camera state into pixels. */
export class Renderer {
  readonly app = new Application();
  private readonly grid = new Graphics();
  private readonly world = new Container();
  private readonly shapeLayer = new Container();
  private readonly draft = new Graphics();
  private readonly overlay = new Graphics();
  private readonly views = new Map<string, ShapeView>();
  private theme: CanvasTheme;
  private hiddenTextId: string | null = null;
  private textResolution = 1;

  constructor(theme: CanvasTheme) {
    this.theme = theme;
  }

  async init(width: number, height: number): Promise<void> {
    await this.app.init({
      width,
      height,
      background: this.theme.background,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      autoStart: false,
      preference: ["webgl", "canvas"],
    });
    this.world.addChild(this.shapeLayer, this.draft);
    this.app.stage.addChild(this.grid, this.world, this.overlay);
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  setTheme(theme: CanvasTheme): void {
    this.theme = theme;
    this.app.renderer.background.color = theme.background;
  }

  /** Creates, updates or removes the views for the given shape ids. */
  syncShapes(shapes: Iterable<Shape>, removed: Iterable<string> = []): void {
    for (const id of removed) {
      const view = this.views.get(id);
      if (!view) continue;
      view.destroy({ children: true });
      this.views.delete(id);
    }
    for (const shape of shapes) {
      let view = this.views.get(shape.id);
      if (view) {
        const indexChanged = view.index !== shape.index;
        view.sync(shape);
        if (indexChanged) this.place(view);
      } else {
        view = new ShapeView(shape);
        view.setTextResolution(this.textResolution);
        view.setTextVisible(shape.id !== this.hiddenTextId);
        this.views.set(shape.id, view);
        this.place(view);
      }
    }
  }

  /** Hides a shape's canvas text while the DOM text editor is showing it. */
  setHiddenText(id: string | null): void {
    if (this.hiddenTextId) this.views.get(this.hiddenTextId)?.setTextVisible(true);
    this.hiddenTextId = id;
    if (id) this.views.get(id)?.setTextVisible(false);
  }

  /** Re-rasterizes text for the current zoom so it stays crisp. */
  setTextZoom(zoom: number): void {
    const dpr = window.devicePixelRatio || 1;
    const resolution = Math.min(dpr * Math.max(1, Math.ceil(zoom * 2) / 2), 8);
    if (resolution === this.textResolution) return;
    this.textResolution = resolution;
    for (const view of this.views.values()) view.setTextResolution(resolution);
  }

  drawDraftStroke(points: number[] | null, color = "#000", size = 4): void {
    this.draft.clear();
    if (!points || points.length < 2) return;
    const outline = strokeOutline(points, size, false);
    if (outline.length >= 6) this.draft.poly(outline).fill({ color });
  }

  render(camera: Camera, overlay: OverlayState): void {
    this.world.scale.set(camera.zoom);
    this.world.position.set(camera.x * camera.zoom, camera.y * camera.zoom);
    this.drawGrid(camera);
    this.drawOverlay(camera, overlay);
    this.app.render();
  }

  destroy(): void {
    this.views.clear();
    this.app.destroy({ removeView: true }, { children: true });
  }

  /** Inserts the view at its z-order position (children sorted by fractional index). */
  private place(view: ShapeView): void {
    const children = this.shapeLayer.children as ShapeView[];
    if (view.parent === this.shapeLayer) this.shapeLayer.removeChild(view);
    let lo = 0;
    let hi = children.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (children[mid]!.index <= view.index) lo = mid + 1;
      else hi = mid;
    }
    this.shapeLayer.addChildAt(view, lo);
  }

  private drawGrid(camera: Camera): void {
    const { width, height } = this.app.screen;
    let spacing = GRID_SPACING * camera.zoom;
    while (spacing < MIN_GRID_SCREEN_SPACING) spacing *= 2;
    const offsetX = mod(camera.x * camera.zoom, spacing);
    const offsetY = mod(camera.y * camera.zoom, spacing);
    const radius = camera.zoom < 0.5 ? 0.8 : 1;

    this.grid.clear();
    for (let x = offsetX; x < width; x += spacing) {
      for (let y = offsetY; y < height; y += spacing) this.grid.circle(x, y, radius);
    }
    this.grid.fill({ color: this.theme.grid });
  }

  private drawOverlay(camera: Camera, state: OverlayState): void {
    const g = this.overlay.clear();
    const color = this.theme.selection;
    const toScreen = (r: Rect, pad = 0) => ({
      x: (r.x + camera.x) * camera.zoom - pad,
      y: (r.y + camera.y) * camera.zoom - pad,
      w: r.w * camera.zoom + pad * 2,
      h: r.h * camera.zoom + pad * 2,
    });

    if (state.hover) {
      const r = toScreen(state.hover, 2);
      g.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1.5, alpha: 0.6 });
    }
    for (const rect of state.selection) {
      const r = toScreen(rect, 2);
      g.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1.5 });
    }
    if (state.selectionBounds) {
      const r = toScreen(state.selectionBounds, 6);
      g.rect(r.x, r.y, r.w, r.h).stroke({ color, width: 1, alpha: 0.7 });
    }
    if (state.marquee) {
      const r = toScreen(state.marquee);
      g.rect(r.x, r.y, r.w, r.h).fill({ color, alpha: 0.08 }).stroke({ color, width: 1 });
    }
  }
}

function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}
