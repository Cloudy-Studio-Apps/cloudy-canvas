import { Application, Container, Rectangle } from "pixi.js";
// Paints' blend modes past Pixi's native ones (overlay, color dodge…).
import "pixi.js/advanced-blend-modes";

import type { Camera } from "../camera";
import type { CanvasElement, ElementKinds } from "../elements";
import type { Point, Rect } from "../geometry.types";
import type { CanvasLinks, Guide } from "../links";
import type { SnapFeedback } from "../snapping";
import { prefersReducedMotion } from "../utils";
import type { CanvasTheme } from "./canvas-theme.types";
import type { HiddenText } from "./element-view.types";
import { ImageCache } from "./image-cache";
import { imageDemands } from "./image-demand";
import type { ImageCacheHost, ImageQuality } from "./image-cache.types";
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
import type { CaptureOptions, ChunkedSyncOptions, RendererOptions } from "./renderer.types";

/**
 * How long `syncElementsChunked` builds views before it lets the window draw a frame: long enough
 * that waiting for frames stays a small part of opening a large file.
 */
const SLICE_MS = 32;

/**
 * How many views `syncElementsChunked` builds per layer sync. A sync brings the layer's mask and
 * effect scopes in line once, so building one view at a time would do that for every element.
 */
const SYNC_BATCH = 64;

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
  /** What's dimmed (`setFaded`), so a capture can draw it undimmed and put it back. */
  private faded: string[] = [];
  private readonly rulerGuides = new RulerGuideLayer();
  private rulerGuidesView: RulerGuidesView | null = null;
  private readonly overlay = new OverlayLayer();
  private readonly sizeLabel = new SizeLabelLayer();
  private readonly snap = new SnapLayer();
  private snapFeedback: SnapFeedback | null = null;
  private readonly images: ImageCache;

  constructor(
    private theme: CanvasTheme,
    private readonly exportTheme: CanvasTheme,
    private readonly kinds: ElementKinds,
    links: readonly CanvasLinks[],
    images: ImageCacheHost,
    private readonly options: RendererOptions,
  ) {
    this.images = new ImageCache(images, (assetIds) => {
      this.elements.redrawImages(assetIds);
      this.frames.redrawImages(assetIds);
      this.draft.redrawImages(assetIds);
    });
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

  /** The background exports and thumbnails are drawn on. */
  get exportBackground(): number {
    return this.exportTheme.background;
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
        const next = Math.min(done + SYNC_BATCH, total);
        this.syncElements(elements.slice(done, next));
        done = next;
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

  /**
   * Shows `elements` as they are now and drops the views of `removed`. Elements that only moved
   * aren't drawn again, unless their id is in `redraw` (what they show changed outside them).
   */
  syncElements(
    elements: Iterable<CanvasElement>,
    removed: Iterable<string> = [],
    redraw?: ReadonlySet<string>,
  ): void {
    const frames: CanvasElement[] = [];
    const others: CanvasElement[] = [];
    for (const el of elements) (this.kinds.kindOf(el).frame ? frames : others).push(el);
    const gone = [...removed];
    this.frames.sync(frames, gone, redraw);
    this.elements.sync(others, gone, redraw);
  }

  /** Plays the entrance (a quick pop) of elements that were just added, unless motion is reduced. */
  animateIn(ids: readonly string[]): void {
    if (prefersReducedMotion()) return;
    const now = performance.now();
    this.elements.animateIn(ids, now);
    this.frames.animateIn(ids, now);
  }

  /** Has elements an edit just moved glide there from where they were, unless motion is reduced. */
  animateMoves(offsets: ReadonlyMap<string, Point>): void {
    if (prefersReducedMotion() || offsets.size === 0) return;
    const now = performance.now();
    this.elements.animateMoves(offsets, now);
    this.frames.animateMoves(offsets, now);
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
    this.faded = list;
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
    this.askForImages(camera.zoom);
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

  /** How sharp the canvas shows a picture now (see `ImageCache.quality`). */
  imageQuality(assetId: string): ImageQuality | null {
    return this.images.quality(assetId);
  }

  /** Runs when a picture's texture changes (loaded, sharpened, let go). */
  onImagesChange(listener: () => void): () => void {
    return this.images.changes.subscribe(listener);
  }

  /** Tells the image cache how sharp the pictures on screen need to be at this zoom. */
  private askForImages(zoom: number): void {
    const uses = [
      ...this.elements.imageUses(true),
      ...this.frames.imageUses(true),
      ...this.draft.imageUses(),
    ];
    const pixelsPerUnit = zoom * this.app.renderer.resolution;
    this.images.want(imageDemands(uses, (id) => this.images.naturalSize(id), pixelsPerUnit));
  }

  /**
   * Draws `rect` of the views already built into a new canvas (file previews): no views are made
   * and no images loaded, so it costs about a frame. Text keeps the resolution of the current
   * zoom. The next `render` puts the camera, culling and effect scale back.
   */
  captureView(rect: Rect, { scale, background, unfaded }: CaptureOptions): HTMLCanvasElement {
    const { x, y } = this.world.position;
    const zoom = this.world.scale.x;
    this.world.position.set(0, 0);
    this.world.scale.set(1);
    this.draft.visible = false;
    this.guide.visible = false;
    this.elements.setEffectScale(1);
    this.frames.setEffectScale(1);
    this.elements.cull(rect);
    this.frames.cull(rect);
    // At rest: gliding and popping views are put back by the next frame's tick.
    this.elements.settle();
    this.frames.settle();
    if (unfaded) {
      this.elements.setFaded([]);
      this.frames.setFaded([]);
    }
    try {
      return this.app.renderer.extract.canvas({
        target: this.world,
        frame: new Rectangle(rect.x, rect.y, rect.w, rect.h),
        resolution: scale,
        clearColor: background,
        antialias: true,
      }) as HTMLCanvasElement;
    } finally {
      this.world.position.set(x, y);
      this.world.scale.set(zoom);
      this.draft.visible = true;
      this.guide.visible = true;
      if (unfaded) {
        this.elements.setFaded(this.faded);
        this.frames.setFaded(this.faded);
      }
    }
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
      this.exportTheme,
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
