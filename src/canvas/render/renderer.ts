import { Application, Container } from "pixi.js";
// Paints' blend modes past Pixi's native ones (overlay, color dodge…).
import "pixi.js/advanced-blend-modes";

import type { Camera } from "../camera";
import type { CanvasElement, ElementKinds } from "../elements";
import type { CanvasLinks, Guide } from "../links";
import type { SnapFeedback } from "../snapping";
import type { CanvasTheme } from "./canvas-theme.types";
import type { HiddenText } from "./element-view.types";
import { ImageCache } from "./image-cache";
import type { ImageCacheHost } from "./image-cache.types";
import { prefersReducedMotion } from "./entrance";
import { DraftLayer } from "./layers/draft-layer";
import { ElementLayer } from "./layers/element-layer";
import { createGridLayer } from "./layers/create-grid-layer";
import type { GridLayer } from "./layers/grid-layer.types";
import { GuideLayer } from "./layers/guide-layer";
import { LinkLayer } from "./layers/link-layer";
import { OverlayLayer } from "./layers/overlay-layer";
import { RulerGuideLayer } from "./layers/ruler-guide-layer";
import type { RulerGuidesView } from "./layers/ruler-guide-layer.types";
import { SizeLabelLayer } from "./layers/size-label-layer";
import { SnapLayer } from "./layers/snap-layer";
import type { OverlayState } from "./overlay-state.types";
import { drawSnapshot } from "./snapshot";
import type { SnapshotOptions } from "./snapshot.types";
import type { ChunkedSyncOptions, RendererOptions } from "./renderer.types";

/** How long `syncElementsChunked` builds views before it lets the window draw a frame. */
const SLICE_MS = 12;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Owns the Pixi application and composes the layers, bottom to top:
 * grid (screen) → world (frames, links, elements, drafts, guides; follows the camera) → ruler
 * guides, overlay, size label and smart guides (screen), with a pixel grid above the world instead.
 * Frames have their own layer so links show above them.
 */
export class Renderer {
  readonly app = new Application();
  private readonly elements: ElementLayer;
  private readonly frames: ElementLayer;
  private readonly draft: DraftLayer;
  private readonly links: LinkLayer;
  private readonly guide = new GuideLayer();
  private readonly grid: GridLayer;
  private readonly world = new Container();
  private readonly rulerGuides = new RulerGuideLayer();
  private rulerGuidesView: RulerGuidesView | null = null;
  private readonly overlay = new OverlayLayer();
  private readonly sizeLabel = new SizeLabelLayer();
  private readonly snap = new SnapLayer();
  private snapFeedback: SnapFeedback | null = null;
  private readonly images: ImageCache;

  constructor(
    private theme: CanvasTheme,
    private readonly kinds: ElementKinds,
    links: readonly CanvasLinks[],
    images: ImageCacheHost,
    private readonly options: RendererOptions,
  ) {
    this.images = new ImageCache(images);
    this.links = new LinkLayer(links);
    this.grid = createGridLayer(options.grid);
    this.elements = new ElementLayer(kinds, this.images, options.placement);
    this.frames = new ElementLayer(kinds, this.images, options.placement);
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
      // Effects that show what's behind them (background blur, glass) read the back buffer.
      useBackBuffer: this.options.backdrop,
    });
    this.world.addChild(this.frames, this.links, this.elements, this.draft, this.guide);
    // The pixel grid lies over the content it measures; dots stay behind it.
    if (this.options.grid === "pixels")
      this.app.stage.addChild(this.world, this.grid, this.rulerGuides);
    else this.app.stage.addChild(this.grid, this.world, this.rulerGuides);
    this.app.stage.addChild(this.overlay, this.sizeLabel, this.snap);
  }

  /** The canvas background color (0xRRGGBB). */
  get background(): number {
    return this.theme.background;
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

  /**
   * Creates the views of `elements` a few at a time, yielding a frame after each slice of
   * `SLICE_MS`, so a large document doesn't freeze the window while it opens. Stops early when
   * `cancelled` turns true.
   */
  async syncElementsChunked(
    elements: readonly CanvasElement[],
    { onProgress, cancelled }: ChunkedSyncOptions,
  ): Promise<void> {
    const total = elements.length;
    let done = 0;
    while (done < total) {
      if (cancelled()) return;
      const start = performance.now();
      while (done < total && performance.now() - start < SLICE_MS) {
        const el = elements[done++]!;
        (this.kinds.kindOf(el).frame ? this.frames : this.elements).sync([el]);
      }
      onProgress(done, total);
      await nextFrame();
    }
  }

  /** Destroys the views of elements not in `ids`. */
  retainElements(ids: ReadonlySet<string>): void {
    this.elements.retain(ids);
    this.frames.retain(ids);
  }

  /** Decodes these image assets ahead of drawing them; `onProgress` hears each one finish. */
  async preloadImages(
    assetIds: readonly string[],
    onProgress: (done: number, total: number) => void,
  ): Promise<void> {
    let done = 0;
    await Promise.all(
      assetIds.map((id) => this.images.load(id).finally(() => onProgress(++done, assetIds.length))),
    );
  }

  syncElements(elements: Iterable<CanvasElement>, removed: Iterable<string> = []): void {
    const frames: CanvasElement[] = [];
    const others: CanvasElement[] = [];
    for (const el of elements) (this.kinds.kindOf(el).frame ? frames : others).push(el);
    const gone = [...removed];
    this.frames.sync(frames, gone);
    this.elements.sync(others, gone);
  }

  /** Plays the entrance (a quick pop) of elements that were just added, unless motion is reduced. */
  animateIn(ids: readonly string[]): void {
    if (prefersReducedMotion()) return;
    const now = performance.now();
    this.elements.animateIn(ids, now);
    this.frames.animateIn(ids, now);
  }

  /** Shows an element that isn't in the document yet, above the others; `null` clears it. */
  setDraft(el: CanvasElement | null): void {
    this.draft.show(el);
  }

  /** Redraws an element's view as `el` has it, though the document doesn't (yet). */
  previewElement(el: CanvasElement): void {
    this.elements.preview(el);
    this.frames.preview(el);
  }

  /** Dims these elements, e.g. the strokes an eraser is about to remove; an empty list clears it. */
  setFaded(ids: Iterable<string>): void {
    const list = [...ids];
    this.elements.setFaded(list);
    this.frames.setFaded(list);
  }

  /** Shows a tool's gesture feedback above the elements; `null` clears it. */
  setGuide(guide: Guide | null): void {
    this.guide.set(guide);
  }

  /** Shows smart guides and measurements (see `Snapper`); `null` clears them. */
  setSnapFeedback(feedback: SnapFeedback | null): void {
    this.snapFeedback = feedback;
  }

  /** Shows the ruler guides (see `CanvasGuides`); `null` hides them. */
  setRulerGuides(view: RulerGuidesView | null): void {
    this.rulerGuidesView = view;
  }

  /** Re-rasterizes text for the zoom level. */
  setTextZoom(zoom: number): void {
    this.elements.setTextZoom(zoom);
    this.frames.setTextZoom(zoom);
    this.links.setTextZoom(zoom);
  }

  /** Lays out these elements' texts again, e.g. once a font they use has loaded. */
  refreshText(ids: readonly string[]): void {
    this.elements.refreshText(ids);
    this.frames.refreshText(ids);
  }

  /** Hides an element's canvas text (or one part of it) while the DOM text editor shows it. */
  setHiddenText(hidden: HiddenText | null): void {
    this.elements.setHiddenText(hidden);
    this.frames.setHiddenText(hidden);
  }

  /**
   * `highlighted`: the selected ids, whose links stand out. Returns whether an animation is
   * playing, so the caller asks for another frame.
   */
  render(camera: Camera, overlay: OverlayState, highlighted: ReadonlySet<string>): boolean {
    const now = performance.now();
    const animating = [this.elements.tick(now), this.frames.tick(now)].includes(true);
    this.world.scale.set(camera.zoom);
    this.world.position.set(camera.x * camera.zoom, camera.y * camera.zoom);
    const visible = camera.visibleWorldRect();
    this.elements.setEffectScale(camera.zoom);
    this.frames.setEffectScale(camera.zoom);
    this.elements.cull(visible);
    this.frames.cull(visible);
    this.grid.draw(camera, this.theme.grid);
    this.links.draw({ zoom: camera.zoom, theme: this.theme, highlighted });
    this.guide.draw({ zoom: camera.zoom, theme: this.theme });
    this.rulerGuides.draw(camera, this.rulerGuidesView, this.theme.snap);
    this.overlay.draw(camera, overlay, this.theme.selection);
    this.sizeLabel.draw(camera, this.options.sizeLabel ? overlay.size : null, this.theme.selection);
    this.snap.draw(camera, this.snapFeedback, this.theme.snap);
    this.app.render();
    return animating;
  }

  /** Draws elements off screen into a new canvas (for exports); the view isn't touched. */
  snapshot(
    elements: readonly CanvasElement[],
    options: SnapshotOptions,
  ): Promise<HTMLCanvasElement> {
    return drawSnapshot(
      this.app.renderer,
      this.kinds,
      this.images,
      this.theme,
      elements,
      this.options.placement,
      options,
    );
  }

  destroy(): void {
    this.app.destroy({ removeView: true }, { children: true });
    this.images.destroy();
  }
}
