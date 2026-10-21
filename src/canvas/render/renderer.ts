import { Application, Container } from "pixi.js";

import type { Camera } from "../camera";
import type { CanvasElement, ElementKinds } from "../elements";
import type { CanvasLinks, Guide } from "../links";
import type { CanvasTheme } from "./canvas-theme.types";
import type { HiddenText } from "./element-view.types";
import { ImageCache } from "./image-cache";
import type { ImageCacheHost } from "./image-cache.types";
import { DraftLayer } from "./layers/draft-layer";
import { ElementLayer } from "./layers/element-layer";
import { GridLayer } from "./layers/grid-layer";
import { GuideLayer } from "./layers/guide-layer";
import { LinkLayer } from "./layers/link-layer";
import { OverlayLayer } from "./layers/overlay-layer";
import type { OverlayState } from "./overlay-state.types";

/**
 * Owns the Pixi application and composes the layers, bottom to top:
 * grid (screen) → world (frames, links, elements, drafts, guides; follows the camera) → overlay
 * (screen). Frames have their own layer so links show above them.
 */
export class Renderer {
  readonly app = new Application();
  private readonly elements: ElementLayer;
  private readonly frames: ElementLayer;
  private readonly draft: DraftLayer;
  private readonly links: LinkLayer;
  private readonly guide = new GuideLayer();
  private readonly grid = new GridLayer();
  private readonly world = new Container();
  private readonly overlay = new OverlayLayer();
  private readonly images: ImageCache;

  constructor(
    private theme: CanvasTheme,
    private readonly kinds: ElementKinds,
    links: readonly CanvasLinks[],
    images: ImageCacheHost,
  ) {
    this.images = new ImageCache(images);
    this.links = new LinkLayer(links);
    this.elements = new ElementLayer(kinds, this.images);
    this.frames = new ElementLayer(kinds, this.images);
    this.draft = new DraftLayer(kinds, this.images);
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
    this.world.addChild(this.frames, this.links, this.elements, this.draft, this.guide);
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
    const frames: CanvasElement[] = [];
    const others: CanvasElement[] = [];
    for (const el of elements) (this.kinds.kindOf(el).frame ? frames : others).push(el);
    const gone = [...removed];
    this.frames.sync(frames, gone);
    this.elements.sync(others, gone);
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
    this.frames.setTextZoom(zoom);
    this.links.setTextZoom(zoom);
  }

  /** Hides an element's canvas text (or one part of it) while the DOM text editor shows it. */
  setHiddenText(hidden: HiddenText | null): void {
    this.elements.setHiddenText(hidden);
    this.frames.setHiddenText(hidden);
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
    this.images.destroy();
  }
}
