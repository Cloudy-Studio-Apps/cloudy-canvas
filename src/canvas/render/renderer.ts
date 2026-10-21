import { Application, Container } from "pixi.js";

import type { Camera } from "../camera";
import type { CanvasElement, ElementKinds } from "../elements";
import type { CanvasTheme } from "./canvas-theme.types";
import { DraftLayer } from "./layers/draft-layer";
import { ElementLayer } from "./layers/element-layer";
import { GridLayer } from "./layers/grid-layer";
import { OverlayLayer } from "./layers/overlay-layer";
import type { OverlayState } from "./overlay-state.types";

/**
 * Owns the Pixi application and composes the layers, bottom to top:
 * grid (screen) → world (elements, drafts; follows the camera) → overlay (screen).
 */
export class Renderer {
  readonly app = new Application();
  private readonly elements: ElementLayer;
  private readonly draft: DraftLayer;
  private readonly grid = new GridLayer();
  private readonly world = new Container();
  private readonly overlay = new OverlayLayer();

  constructor(
    private theme: CanvasTheme,
    kinds: ElementKinds,
  ) {
    this.elements = new ElementLayer(kinds);
    this.draft = new DraftLayer(kinds);
  }

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
    this.world.addChild(this.elements, this.draft);
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

  syncElements(elements: Iterable<CanvasElement>, removed: Iterable<string> = []): void {
    this.elements.sync(elements, removed);
  }

  /** Shows an element that isn't in the document yet, above the others; `null` clears it. */
  setDraft(el: CanvasElement | null): void {
    this.draft.show(el);
  }

  /** Re-rasterizes text for the zoom level. */
  setTextZoom(zoom: number): void {
    this.elements.setTextZoom(zoom);
  }

  /** Hides an element's canvas text while the DOM text editor shows it. */
  setHiddenText(id: string | null): void {
    this.elements.setHiddenText(id);
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
