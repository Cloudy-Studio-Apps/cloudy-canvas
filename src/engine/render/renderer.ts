import { Application, Container } from "pixi.js";

import type { Camera } from "../camera";
import type { Shape } from "../document";
import type { CanvasTheme } from "./canvas-theme.types";
import { DraftStrokeLayer } from "./layers/draft-stroke-layer";
import { GridLayer } from "./layers/grid-layer";
import { OverlayLayer } from "./layers/overlay-layer";
import { ShapeLayer } from "./layers/shape-layer";
import type { OverlayState } from "./overlay-state.types";

/**
 * Owns the Pixi application and composes the layers, bottom to top:
 * grid (screen) → world (shapes + draft stroke, follows the camera) → overlay (screen).
 */
export class Renderer {
  readonly app = new Application();
  readonly shapes = new ShapeLayer();
  readonly draftStroke = new DraftStrokeLayer();
  private readonly grid = new GridLayer();
  private readonly world = new Container();
  private readonly overlay = new OverlayLayer();

  constructor(private theme: CanvasTheme) {}

  async init(width: number, height: number): Promise<void> {
    await this.app.init({
      width,
      height,
      background: this.theme.background,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      autoStart: false, // render on demand only
      preference: ["webgl", "canvas"],
    });
    this.world.addChild(this.shapes, this.draftStroke);
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

  syncShapes(shapes: Iterable<Shape>, removed?: Iterable<string>): void {
    this.shapes.sync(shapes, removed);
  }

  render(camera: Camera, overlay: OverlayState): void {
    this.world.scale.set(camera.zoom);
    this.world.position.set(camera.x * camera.zoom, camera.y * camera.zoom);
    this.grid.draw(camera, this.theme.grid);
    this.overlay.draw(camera, overlay, this.theme.selection);
    this.app.render();
  }

  destroy(): void {
    this.app.destroy({ removeView: true }, { children: true });
  }
}
