import { Application, Container } from "pixi.js";

import type { Camera } from "../camera";
import type { CanvasElement, ElementKinds } from "../elements";
import type { CanvasLinks, Guide } from "../links";
import type { CanvasTheme } from "./canvas-theme.types";
import { DraftLayer } from "./layers/draft-layer";
import { ElementLayer } from "./layers/element-layer";
import { GridLayer } from "./layers/grid-layer";
import { GuideLayer } from "./layers/guide-layer";
import { LinkLayer } from "./layers/link-layer";
import { OverlayLayer } from "./layers/overlay-layer";
import type { OverlayState } from "./overlay-state.types";

/**
 * Owns the Pixi application and composes the layers, bottom to top:
 * grid (screen) → world (links, elements, drafts, guides; follows the camera) → overlay (screen).
 */
export class Renderer {
  readonly app = new Application();
  private readonly elements: ElementLayer;
  private readonly draft: DraftLayer;
  private readonly links: LinkLayer;
  private readonly guide = new GuideLayer();
  private readonly grid = new GridLayer();
  private readonly world = new Container();
  private readonly overlay = new OverlayLayer();

  constructor(
    private theme: CanvasTheme,
    kinds: ElementKinds,
    links: readonly CanvasLinks[],
  ) {
    this.links = new LinkLayer(links);
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
    this.world.addChild(this.links, this.elements, this.draft, this.guide);
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

  /** Shows a tool's gesture feedback above the elements; `null` clears it. */
  setGuide(guide: Guide | null): void {
    this.guide.set(guide);
  }

  /** Re-rasterizes text for the zoom level. */
  setTextZoom(zoom: number): void {
    this.elements.setTextZoom(zoom);
  }

  /** Hides an element's canvas text while the DOM text editor shows it. */
  setHiddenText(id: string | null): void {
    this.elements.setHiddenText(id);
  }

  /** `highlighted`: the selected ids, whose links stand out. */
  render(camera: Camera, overlay: OverlayState, highlighted: ReadonlySet<string>): void {
    this.world.scale.set(camera.zoom);
    this.world.position.set(camera.x * camera.zoom, camera.y * camera.zoom);
    this.grid.draw(camera, this.theme.grid);
    this.links.draw({ zoom: camera.zoom, theme: this.theme, highlighted });
    this.guide.draw({ zoom: camera.zoom, theme: this.theme });
    this.overlay.draw(camera, overlay, this.theme.selection);
    this.app.render();
  }

  destroy(): void {
    this.app.destroy({ removeView: true }, { children: true });
  }
}
