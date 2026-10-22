import { fontKey, type Clipboard, type DroppedFile } from "@shared/core";

import { Camera } from "./camera";
import {
  alignOffset,
  anchorPoint,
  arrangeItems,
  arrangeRoots,
  distributeOffsets,
  nudgeCheckpoint,
  scalePatches,
  tidyUpOffsets,
  type Alignment,
  type ArrangeHost,
  type ArrangeItem,
  type DistributeAxis,
  type RotatePivot,
  type ScaleAnchor,
} from "./arrange";
import { DEFAULT_VIEW_OPTIONS } from "./canvas-view";
import {
  dropFiles,
  ElementClipboard,
  MemoryClipboard,
  PASTE_STEP,
  type DropResult,
  type ElementClipboardHost,
} from "./clipboard";
import { createCommands } from "./commands";
import type { Commands } from "./commands.types";
import { CanvasDocument, type DocumentChange } from "./document";
import {
  elementBounds,
  elementInfo,
  reorderIndexes,
  type CanvasElement,
  type ElementInfo,
  type ElementKinds,
  type ElementPatch,
  type ReorderDirection,
} from "./elements";
import {
  exportElements,
  hasRows,
  renderThumbnail,
  type ExportArea,
  type ExportHost,
  type ExportOptions,
  type ThumbnailOptions,
} from "./export";
import { findInteraction } from "./find-interaction";
import type { EngineLoading } from "./engine-loading.types";
import type { EngineState } from "./engine-state.types";
import { intersectRects, rectCenter, rectsIntersect, unionRects } from "./geometry";
import type { Point, Rect } from "./geometry.types";
import {
  bindKeyboard,
  bindWheel,
  EdgeAutoPan,
  Keymap,
  PointerInput,
  toCanvasPointer,
} from "./input";
import { clipBounds, Renderer, type CanvasTheme } from "./render";
import {
  guideInside,
  overRuler,
  placeGuides,
  rulerGuideKey,
  RULER_SIZE,
  screenAxis,
  ScopeGuides,
  type PlacedGuide,
  type RulerGuide,
} from "./ruler-guides";
import { Scene } from "./scene";
import { ServiceCache, type ServiceDef } from "./services";
import {
  GestureSnapper,
  snapTargets,
  type SnapAxis,
  type SnapFeedback,
  type SnapSettings,
  type SnapTargets,
} from "./snapping";
import { FontTracker, loadFonts, TextEditor } from "./text";
import { createBaseTools, type CanvasPointer, type Tool, type ToolContext } from "./tools";
import { GuideDrag } from "./tools/guide-drag";
import { debounce, delay, Disposables, Emitter, FrameScheduler, Store } from "./utils";
import type {
  CanvasEngineOptions,
  ContextMenuRequest,
  ElementAction,
  GuideDragHandle,
  HostAction,
  ScopeView,
} from "./canvas-engine.types";
import type { CanvasProduct, CanvasScopes } from "./canvas-product.types";
import type { CanvasViewOptions } from "./canvas-view.types";
import type { CanvasLinks } from "./links";

const ZOOM_STEP = 1.25;
const HIT_TOLERANCE_PX = 4;
/** Text is re-rasterized for the new zoom once zooming settles. */
const TEXT_ZOOM_DELAY_MS = 150;
/** Pixels per world unit of "Copy as PNG". */
const COPY_PNG_SCALE = 2;
/** How long `close()` waits for its tasks before destroying the engine anyway. */
const CLOSE_TIMEOUT_MS = 3000;
/** Longest `mount` waits for images and fonts; whatever is still loading pops in later. */
const CONTENT_TIMEOUT_MS = 8000;

/**
 * Framework-agnostic infinite canvas, shared by every product (boards, designs). Wires the
 * document, camera, renderer, tools and input together; the product it's created with brings the
 * element kinds, tools, keymap and tool options. Hosts call `mount(container)` and drive it through
 * the public methods; UI state is exposed via `subscribe()` / `getState()`. `O` is the product's
 * tool options.
 */
export class CanvasEngine<O extends object = object> {
  readonly doc: CanvasDocument;
  /** The product's element kinds; ask them about any element. */
  readonly kinds: ElementKinds<O>;
  /** The product's shortcuts; hosts read labels with `keymap.label(command)`. */
  readonly keymap: Keymap;
  readonly commands: Commands;
  /** The product's id (e.g. "board"). */
  readonly productId: string;
  /** The product's view: zoom range, grid, selection chrome and default snapping. */
  readonly view: CanvasViewOptions;
  private readonly ownsDocument: boolean;
  private readonly product: CanvasProduct<O>;
  private readonly links: CanvasLinks[];
  private readonly camera = new Camera();
  private readonly renderer: Renderer;
  private readonly scene: Scene;
  private readonly fontTracker: FontTracker;
  /** What tools (and the product's `editElement`) reach of the engine. */
  private readonly toolContext: ToolContext<O>;
  private readonly services: ServiceCache;
  private readonly clipboard: ElementClipboard<O>;
  private readonly systemClipboard: Clipboard;
  private readonly tools: Map<string, Tool>;
  private readonly store: Store<EngineState<O>>;
  private readonly disposables = new Disposables();
  private readonly frames = new FrameScheduler(() => this.draw());
  private readonly autoPan = new EdgeAutoPan(this.camera, (dx, dy) => {
    this.camera.panBy(dx, dy);
    this.onCameraChange();
  });
  private readonly updateTextZoom = debounce(() => {
    this.renderer.setTextZoom(this.camera.zoom);
    this.requestRender();
  }, TEXT_ZOOM_DELAY_MS);

  private readonly viewChanges = new Emitter();
  private readonly elementActions = new Set<(action: ElementAction) => void>();
  private readonly contextMenus = new Set<(request: ContextMenuRequest) => void>();
  private readonly hostActions = new Map<string, HostAction>();
  private readonly closeTasks = new Map<string, () => Promise<void>>();
  private readonly scopes: CanvasScopes | undefined;
  /** The scopes as of the last document change, to find the next one when the shown one goes. */
  private scopeList: string[] = [];
  /** Each scope's camera when it was last left, restored when it's shown again. */
  private readonly scopeViews = new Map<string, ScopeView>();
  /** Set while undoing or redoing, so the canvas follows the change to its scope. */
  private followHistory = false;
  private readonly scopeGuides: ScopeGuides;
  /** Whether the ruler guides are drawn (and grabbed, and snapped to). */
  private guidesShown = true;
  /** Whether the host shows its rulers (see `CanvasViewOptions.rulers`). */
  private rulersShown: boolean;
  /** The frame the rulers measure, until the selection or the document changes. */
  private rulerFrameCache: { frame: CanvasElement | null } | null = null;
  /** Where the scope's guides show, until the document or the scope changes. */
  private placedCache: PlacedGuide[] | null = null;
  /** The guide whose value shows while it's dragged. */
  private activeGuide: number | null = null;
  private tool: Tool;
  private options: O;
  private snapping: SnapSettings;
  private container: HTMLElement | null = null;
  private textEditor: TextEditor | null = null;
  private mounted = false;
  private destroyed = false;
  private closing = false;
  private rendererReady = false;

  constructor({ product, theme, document, clipboard, fonts }: CanvasEngineOptions<O>) {
    this.product = product;
    this.productId = product.id;
    this.kinds = product.kinds;
    this.keymap = new Keymap(product.keybindings);
    this.options = product.defaultOptions;
    this.doc = document ?? new CanvasDocument(this.kinds);
    this.ownsDocument = !document;
    this.services = new ServiceCache(this.doc);
    this.links = product.createLinks?.() ?? [];
    const view = { ...DEFAULT_VIEW_OPTIONS, ...product.view };
    this.view = view;
    this.snapping = view.snapping;
    this.rulersShown = view.rulers;
    this.camera.setZoomLimits(view.minZoom, view.maxZoom);
    this.renderer = new Renderer(
      theme,
      this.kinds,
      this.links,
      { read: (id) => this.doc.getAsset(id), onLoad: () => this.requestRender() },
      {
        grid: view.grid,
        sizeLabel: view.sizeLabel,
        placement: {
          orderOf: (el, kind) => this.scene.orderKey(el, kind),
          clipOf: (el) => this.scene.clipOf(el),
        },
      },
    );
    const scopes = product.scopes;
    this.scopes = scopes;
    this.scene = new Scene(this.doc, this.kinds, {
      scopeOf: scopes ? (el) => scopes.of(el) : undefined,
      resolve: product.resolveElements?.bind(product),
      orderKeys: product.orderKeys?.bind(product),
      clips: product.clips?.bind(product),
    });
    if (scopes) {
      this.scopeList = scopes.list(this.doc);
      this.scene.scope = this.scopeList[0] ?? null;
      // New elements land in the scope on screen.
      this.doc.setPlacement((el) => {
        const scope = this.scene.scope;
        return scope === null ? el : scopes.place(el, scope);
      });
    }
    this.scopeGuides = new ScopeGuides(this.doc, product.guides);
    this.fontTracker = new FontTracker(fonts, (key) => this.handleFontLoad(key));
    this.systemClipboard = clipboard ?? new MemoryClipboard();
    this.clipboard = this.createClipboard(this.systemClipboard);
    const ctx = this.createToolContext();
    this.toolContext = ctx;
    const tools = [...createBaseTools(ctx), ...product.createTools(ctx)];
    this.tools = new Map(tools.map((tool) => [tool.id, tool]));
    this.tool = tools[0]!;
    this.commands = createCommands(this, [...this.tools.keys()], product.hostCommands ?? []);
    this.store = new Store(this.buildState());
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  /**
   * Starts the renderer in `container` and builds the views a slice at a time, then waits (at most
   * `CONTENT_TIMEOUT_MS`) for the images and fonts on screen, so the canvas shows up complete.
   * `onLoading` hears each step, for a loading screen; input starts once it resolves.
   */
  async mount(
    container: HTMLElement,
    onLoading: (loading: EngineLoading) => void = () => undefined,
  ): Promise<void> {
    if (this.mounted || this.destroyed) return;
    this.mounted = true;
    this.container = container;
    const { width, height } = container.getBoundingClientRect();

    onLoading({ stage: "Starting canvas", progress: null });
    await Promise.all([this.renderer.init(width, height), loadFonts(this.kinds)]);
    if (this.destroyed || this.closing) {
      this.renderer.destroy();
      return;
    }
    this.rendererReady = true;

    const { canvas } = this.renderer;
    canvas.style.display = "block";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);
    this.textEditor = this.createTextEditor(container);

    this.camera.setViewport(width, height);
    this.refreshScene();
    // Opens showing everything (at most 100%), or the origin when the canvas is empty.
    const content = this.scene.contentBounds();
    if (content) this.camera.fitRect(content);
    else this.camera.reset();
    this.renderer.setTextZoom(this.camera.zoom);

    // The document isn't observed until input starts: a change meanwhile redraws everything.
    let changed = false;
    const stopWatching = this.doc.onChange(() => (changed = true));
    try {
      await this.renderer.syncElementsChunked(this.scene.elements, {
        onProgress: (done, total) =>
          onLoading({ stage: "Drawing layers", progress: { done, total } }),
        cancelled: () => this.destroyed || this.closing,
      });
      if (this.destroyed || this.closing) return;
      await this.loadContent(onLoading);
      if (this.destroyed || this.closing) return;
    } finally {
      stopWatching();
    }
    if (changed) {
      this.refreshScene();
      this.renderer.syncElements(this.scene.elements);
      this.renderer.retainElements(new Set(this.scene.elements.map((el) => el.id)));
    }

    this.bindInput(container, canvas);
    this.frames.start();
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  /**
   * Work to finish before the engine closes (e.g. a thumbnail of the canvas), keyed so setting it
   * again replaces it. It runs in `close()`, while the engine can still draw.
   */
  onClose(key: string, task: () => Promise<void>): void {
    this.closeTasks.set(key, task);
  }

  /** Stops taking input, runs the `onClose` tasks (for at most a few seconds), then destroys. */
  async close(): Promise<void> {
    if (this.destroyed || this.closing) return;
    this.closing = true;
    this.disposables.dispose();
    const tasks = [...this.closeTasks.values()].map((task) => task());
    await Promise.race([Promise.allSettled(tasks), delay(CLOSE_TIMEOUT_MS)]);
    this.destroy();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.frames.stop();
    this.autoPan.stop();
    this.updateTextZoom.cancel();
    this.fontTracker.destroy();
    this.disposables.dispose();
    this.textEditor?.destroy();
    this.store.destroy();
    this.viewChanges.clear();
    this.elementActions.clear();
    this.contextMenus.clear();
    if (this.scopes) this.doc.setPlacement(null);
    // If mount() is still awaiting init, it destroys the renderer itself once init resolves.
    if (this.rendererReady) this.renderer.destroy();
    if (this.ownsDocument) this.doc.destroy();
  }

  // ── Public API for hosts ──────────────────────────────────────────────

  subscribe = (listener: () => void) => this.store.subscribe(listener);
  getState = (): EngineState<O> => this.store.get();

  /** A service of this engine (e.g. a board's database schema), created on first use. */
  service<T>(def: ServiceDef<T>): T {
    return this.services.get(def);
  }

  setTheme(theme: CanvasTheme): void {
    this.renderer.setTheme(theme);
    this.requestRender();
  }

  /**
   * Lets the host handle a shortcut that needs app-level UI (`save`, `saveAs` or one of the
   * product's `hostCommands`). Returns a function that removes the handler.
   */
  handleHostAction(action: string, handler: HostAction): () => void {
    this.hostActions.set(action, handler);
    return () => {
      if (this.hostActions.get(action) === handler) this.hostActions.delete(action);
    };
  }

  /** Returns `false` when the host doesn't handle the action, so the key event isn't consumed. */
  runHostAction(action: string): boolean {
    const handler = this.hostActions.get(action);
    if (!handler) return false;
    this.textEditor?.commit();
    handler();
    return true;
  }

  /** Switches to a tool by id. Unknown ids are ignored. */
  setTool(id: string): void {
    const next = this.tools.get(id);
    if (!next || this.tool === next) return;
    this.tool.onCancel?.();
    this.renderer.setFaded([]);
    this.renderer.setSnapFeedback(null);
    this.tool = next;
    this.scene.resizeMode = next.resizeMode ?? "resize";
    this.scene.setHover(null);
    this.setCursor(this.tool.cursor);
    this.tool.onActivate?.();
    this.requestRender();
    this.emitChange();
  }

  /** Changes what snaps (the host keeps the user's choice). */
  setSnapping(patch: Partial<SnapSettings>): void {
    this.snapping = { ...this.snapping, ...patch };
    this.emitChange();
  }

  /** Whether the active tool handles this command itself (see `Tool.onCommand`). */
  toolTakes(command: string): boolean {
    return this.tool.onCommand?.(command) ?? false;
  }

  setToolOptions(patch: Partial<O>): void {
    this.options = { ...this.options, ...patch };
    this.restyleSelection(patch);
    this.emitChange();
  }

  undo(): void {
    this.textEditor?.commit();
    this.followHistory = true;
    try {
      this.doc.undo();
    } finally {
      this.followHistory = false;
    }
  }

  redo(): void {
    this.textEditor?.commit();
    this.followHistory = true;
    try {
      this.doc.redo();
    } finally {
      this.followHistory = false;
    }
  }

  /** The scope on screen (a design's page, see `CanvasScopes`), or `null` without scopes. */
  get scope(): string | null {
    return this.scene.scope;
  }

  /**
   * Shows another scope: the selection is cleared and the camera goes back to where it was when
   * that scope was last shown (or fits its content). Unknown ids are ignored.
   */
  setScope(id: string): void {
    if (id === this.scene.scope || !this.scopes?.list(this.doc).includes(id)) return;
    this.textEditor?.commit();
    this.showScope(id);
  }

  // ── Ruler guides ──────────────────────────────────────────────────────

  /** Whether the product keeps ruler guides (see `CanvasGuides`). */
  get hasGuides(): boolean {
    return this.scopeGuides.kept;
  }

  /** The ruler guides of the scope on screen. */
  guides(): readonly RulerGuide[] {
    return this.scopeGuides.list(this.scene.scope);
  }

  /** Replaces the scope's ruler guides as one undo step. */
  setGuides(guides: readonly RulerGuide[]): void {
    if (!this.hasGuides) return;
    this.doc.checkpoint();
    this.scopeGuides.write(this.scene.scope, guides);
  }

  addGuides(guides: readonly RulerGuide[]): void {
    this.setGuides([...this.guides(), ...guides]);
  }

  /** Removes the guides at these indexes (all of them without any) as one undo step. */
  removeGuides(indexes?: Iterable<number>): void {
    const gone = indexes ? new Set(indexes) : null;
    const kept = gone ? this.guides().filter((_, i) => !gone.has(i)) : [];
    if (kept.length !== this.guides().length) this.setGuides(kept);
  }

  /** Shows or hides the ruler guides (hidden ones aren't grabbed or snapped to). */
  setGuidesShown(shown: boolean): void {
    if (this.guidesShown === shown) return;
    this.guidesShown = shown;
    this.requestRender();
    this.emitChange();
  }

  /** Tells the engine whether the host shows its rulers, where a guide dropped is removed. */
  setRulersShown(shown: boolean): void {
    if (this.rulersShown === shown) return;
    this.rulersShown = shown;
    this.requestRender();
    this.emitChange();
  }

  /**
   * Starts dragging a new ruler guide out of a ruler the host draws (on `x` a vertical one, out of
   * the left ruler), from a pointer press there. `null` when the canvas keeps no guides.
   */
  beginGuideDrag(axis: SnapAxis, event: PointerEvent): GuideDragHandle | null {
    const canvas = this.rendererReady ? this.renderer.canvas : null;
    if (!canvas || !this.hasGuides) return null;
    this.textEditor?.commit();
    this.setGuidesShown(true);
    const pointer = (e: PointerEvent) => toCanvasPointer(e, canvas, this.camera);
    const frame = this.rulersShown ? this.rulerFrameElement() : null;
    const owner = frame && {
      id: frame.id,
      bounds: this.kinds.kindOf(frame).bounds(frame),
      rotation: frame.rotation ?? 0,
    };
    // In a turned frame, the guide runs along the frame's axis closest to the ruler's.
    const along = owner ? screenAxis(axis, owner.rotation) : axis;
    const drag = new GuideDrag(this.toolContext, along, null, owner, pointer(event));
    return {
      move: (e) => drag.move(pointer(e)),
      end: () => {
        drag.end();
        this.setCursor(this.tool.cursor);
      },
    };
  }

  /** Selects every element that isn't locked. */
  selectAll(): void {
    this.setSelection(this.scene.elements.filter((el) => !el.locked).map((el) => el.id));
  }

  /** Returns `false` when nothing was selected. A selected part is deleted instead of its element. */
  deleteSelection(): boolean {
    if (this.deleteSelectedPart()) return true;
    if (this.scene.selection.size === 0) return false;
    this.deleteElements(this.scene.selection.ids);
    this.setSelection([]);
    return true;
  }

  /** Copies the selection (with what moves with it) to the clipboard. */
  copySelection(): boolean {
    return this.clipboard.copy(this.scene.selection.ids);
  }

  cutSelection(): boolean {
    if (!this.copySelection()) return false;
    return this.deleteSelection();
  }

  /** Pastes the clipboard's elements (or its image or text) and selects them. */
  paste(): void {
    this.textEditor?.commit();
    void this.clipboard.paste();
  }

  /**
   * Adds files dropped on the canvas at `client` (client pixels): images and SVGs as pasted
   * images, `.txt` files as pasted text, as one undo step, and selects them. Nothing is added
   * outside the canvas.
   */
  async dropFiles(files: readonly DroppedFile[], client: Point): Promise<DropResult> {
    if (!this.container) return { added: [], skipped: [] };
    const box = this.container.getBoundingClientRect();
    const inside =
      client.x >= box.left &&
      client.x <= box.right &&
      client.y >= box.top &&
      client.y <= box.bottom;
    if (!inside) return { added: [], skipped: [] };
    this.textEditor?.commit();
    const at = this.camera.screenToWorld({ x: client.x - box.left, y: client.y - box.top });
    return dropFiles(this.clipboardHost, files, at);
  }

  /**
   * Pastes the clipboard in place of the selection (centered on it), as one undo step. Returns
   * `false` when nothing was selected.
   */
  pasteToReplace(): boolean {
    if (this.scene.selection.size === 0) return false;
    this.textEditor?.commit();
    const replace = [...this.withMembers(this.scene.selection.ids, "delete")];
    void this.clipboard.paste({ replace });
    return true;
  }

  /**
   * Copies the selection (with what moves with it) to the clipboard as a PNG image. Rejects with
   * a message for the user when nothing is selected or it can't be copied.
   */
  async copyAsPng(ids?: readonly string[]): Promise<void> {
    if ((ids?.length ?? this.scene.selection.size) === 0) {
      throw new Error("Select something to copy.");
    }
    this.textEditor?.commit();
    const options = { format: "png", background: "transparent", area: "selection", ids } as const;
    const png = await exportElements(this.exportHost, { ...options, scale: COPY_PNG_SCALE });
    await this.systemClipboard.writeImage(png);
  }

  /**
   * Exports the selection (with what moves with it) or the whole canvas as an image, a PDF page
   * or CSV. Rejects with a message for the user when there's nothing to export.
   */
  exportElements(options: ExportOptions): Promise<Blob> {
    this.textEditor?.commit();
    return exportElements(this.exportHost, options);
  }

  /** A small JPEG of the whole canvas for file previews, or `null` when it's empty. */
  thumbnail(options: ThumbnailOptions): Promise<Blob | null> {
    if (!this.rendererReady) return Promise.resolve(null);
    return renderThumbnail(this.exportHost, options);
  }

  /** Whether an area holds elements that export as CSV (e.g. tables). */
  canExportCsv(area: ExportArea): boolean {
    return hasRows(this.exportHost, { area });
  }

  /**
   * Moves the selection (with what moves with it) in the drawing order, as one undo step: to the
   * front or back, or one step past the nearest element it overlaps. Frames keep their order
   * (larger behind smaller). Returns `false` when nothing was selected.
   */
  reorderSelection(direction: ReorderDirection): boolean {
    if (this.scene.selection.size === 0) return false;
    this.reorderElements(this.scene.selection.ids, direction);
    return true;
  }

  /**
   * Moves elements (with what moves with them) in the drawing order, as `reorderSelection` does
   * with the selection. Returns the ids whose position changed.
   */
  reorderElements(ids: Iterable<string>, direction: ReorderDirection): string[] {
    const indexes = reorderIndexes({
      layer: this.scene.elements.filter((el) => !this.kinds.kindOf(el).frame),
      moving: this.withMembers(ids, "move"),
      direction,
      bounds: (el) => elementBounds(this.kinds.kindOf(el), el),
      above: (count) => this.doc.nextIndexes(count),
      below: (count) => this.doc.firstIndexes(count),
    });
    if (indexes.size === 0) return [];
    this.doc.checkpoint();
    this.doc.updateMany(new Map([...indexes].map(([id, index]) => [id, { index }])));
    return [...indexes.keys()];
  }

  /**
   * Locks the selection (with what moves with it), or unlocks it when it's all locked, as one
   * undo step. Returns `false` when nothing was selected.
   */
  toggleLockSelection(): boolean {
    if (this.scene.selection.size === 0) return false;
    const ids = this.withMembers(this.scene.selection.ids, "move");
    const locked = [...this.scene.selection.ids].every((id) => this.scene.get(id)?.locked);
    this.setLocked(ids, !locked);
    return true;
  }

  /** Unlocks every locked element, as one undo step. Returns `false` when none was locked. */
  unlockAll(): boolean {
    const locked = this.scene.elements.filter((el) => el.locked).map((el) => el.id);
    if (locked.length === 0) return false;
    this.setLocked(locked, false);
    return true;
  }

  /**
   * Locks or unlocks elements, as one undo step (see `CanvasElement.locked`). Returns the ids
   * that changed.
   */
  setLocked(ids: Iterable<string>, locked: boolean): string[] {
    const patches = new Map<string, ElementPatch>();
    for (const id of ids) {
      const el = this.scene.get(id);
      if (el && Boolean(el.locked) !== locked) patches.set(id, { locked });
    }
    if (patches.size === 0) return [];
    this.doc.checkpoint();
    this.doc.updateMany(patches);
    return [...patches.keys()];
  }

  /**
   * Moves the selection (with what moves with it) by (dx, dy), as the arrow keys do; a burst of
   * presses is one undo step. Unlike a drag, nothing changes parent. Returns `false` when nothing
   * was selected.
   */
  nudgeSelection(dx: number, dy: number): boolean {
    if (this.scene.selection.size === 0) return false;
    nudgeCheckpoint(this.doc);
    this.moveElements(this.scene.selection.ids, dx, dy);
    return true;
  }

  /**
   * Moves elements, with what moves with them (locked ones stay put), by (dx, dy). Returns the
   * moved ids. The caller starts the undo step.
   */
  moveElements(ids: Iterable<string>, dx: number, dy: number): string[] {
    return this.moveElementsBy(new Map([...ids].map((id) => [id, { x: dx, y: dy }])));
  }

  /**
   * Moves each element, with what moves with it (locked ones stay put), by its own offset.
   * Returns the moved ids. The caller starts the undo step.
   */
  moveElementsBy(offsets: ReadonlyMap<string, Point>): string[] {
    const patches = new Map<string, ElementPatch>();
    for (const [id, { x, y }] of offsets) {
      if (x === 0 && y === 0) continue;
      for (const member of this.withMembers([id], "move")) {
        const el = this.doc.get(member);
        if (el && !el.locked) patches.set(member, this.kinds.kindOf(el).move(el, x, y));
      }
    }
    if (patches.size > 0) this.doc.updateMany(patches);
    return [...patches.keys()];
  }

  /**
   * Lines the selection up on an edge or center, as one undo step: elements with each other,
   * or one element with what holds it (`CanvasProduct.alignTarget`). Returns `false` when
   * nothing was selected.
   */
  alignSelection(alignment: Alignment): boolean {
    if (this.scene.selection.size === 0) return false;
    this.alignElements(this.scene.selection.ids, alignment);
    return true;
  }

  /**
   * Lines elements up as `alignSelection` does, with what moves with them. Nothing changes
   * parent. Returns the moved ids.
   */
  alignElements(ids: Iterable<string>, alignment: Alignment): string[] {
    const items = this.arrangeItems(ids);
    const target = this.alignTargetOf(items);
    if (!target) return [];
    return this.arrange(
      new Map(items.map((item) => [item.id, alignOffset(item.rect, target, alignment)])),
    );
  }

  /** Whether these elements can be aligned: several of them, or one inside something. */
  canAlign(ids: Iterable<string>): boolean {
    return this.alignTargetOf(this.arrangeItems(ids)) !== null;
  }

  /**
   * Turns the selection by `degrees` (counterclockwise) round its middle, as one undo step.
   * Returns `false` when nothing in it can turn.
   */
  rotateSelection(degrees: number): boolean {
    return this.rotateElements(this.scene.selection.ids, degrees).length > 0;
  }

  /**
   * Turns elements that can turn (`ElementKind.rotatable`), with what moves with them, by
   * `degrees` (or each one's own, from a function) round the middle of them all, or each round its
   * own middle, as one undo step. Returns the turned ids.
   */
  rotateElements(
    ids: Iterable<string>,
    degrees: number | ((el: CanvasElement) => number),
    around: RotatePivot = "selection",
  ): string[] {
    const roots = arrangeRoots(ids, this.arrangeHost).filter(
      (el) => this.kinds.kindOf(el).rotatable,
    );
    const shown = (el: CanvasElement) => elementBounds(this.kinds.kindOf(el), el);
    const all = unionRects(roots.map(shown));
    if (!all) return [];
    const patches = new Map<string, ElementPatch>();
    for (const root of roots) {
      const turn = typeof degrees === "number" ? degrees : degrees(root);
      if (!turn) continue;
      const pivot = rectCenter(around === "each" ? shown(root) : all);
      for (const id of this.withMembers([root.id], "move")) {
        const el = this.scene.get(id);
        const kind = el && this.kinds.kindOf(el);
        if (el && kind?.rotatable && !el.locked) patches.set(id, kind.rotate(el, turn, pivot));
      }
    }
    if (patches.size === 0) return [];
    this.doc.checkpoint();
    this.doc.updateMany(patches);
    return [...patches.keys()];
  }

  /**
   * Scales elements and their content (fonts, strokes, radii, what moves with them) by `factor`
   * round `anchor` of the box round them, as the Scale tool does, in one undo step. Locked ones
   * stay. Returns the scaled ids.
   */
  scaleElements(ids: Iterable<string>, factor: number, anchor: ScaleAnchor = "top-left"): string[] {
    if (!(factor > 0) || factor === 1) return [];
    const unlocked = (el: CanvasElement | undefined): el is CanvasElement => !!el && !el.locked;
    const roots = [...ids].map((id) => this.scene.get(id)).filter(unlocked);
    const box = unionRects(roots.map((el) => elementBounds(this.kinds.kindOf(el), el)));
    if (!box) return [];
    const members = this.withMembers(
      roots.map((el) => el.id),
      "move",
    );
    const scaled = [...members].map((id) => this.scene.get(id)).filter(unlocked);
    const t = { origin: anchorPoint(box, anchor), factor };
    const patches = scalePatches(scaled, this.kinds, t);
    if (patches.size === 0) return [];
    this.doc.checkpoint();
    this.doc.updateMany(patches);
    return [...patches.keys()];
  }

  /** Spaces the selection out evenly on `axis` (three elements or more), as one undo step. */
  distributeSelection(axis: DistributeAxis): boolean {
    if (this.scene.selection.size === 0) return false;
    this.distributeElements(this.scene.selection.ids, axis);
    return true;
  }

  /**
   * Spaces elements out evenly on `axis`, the first and last staying put, with what moves with
   * them. Returns the moved ids.
   */
  distributeElements(ids: Iterable<string>, axis: DistributeAxis): string[] {
    return this.arrange(distributeOffsets(this.arrangeItems(ids), axis));
  }

  /** Tidies the selection into a grid with even spacing, as one undo step. */
  tidyUpSelection(): boolean {
    if (this.scene.selection.size === 0) return false;
    this.tidyUpElements(this.scene.selection.ids);
    return true;
  }

  /** Tidies elements into rows and columns, with what moves with them. Returns the moved ids. */
  tidyUpElements(ids: Iterable<string>): string[] {
    return this.arrange(tidyUpOffsets(this.arrangeItems(ids)));
  }

  /** Adds a copy of the selection next to it and selects the copy. Returns `false` when nothing was selected. */
  duplicateSelection(): boolean {
    const selected = [...this.scene.selection.ids];
    if (selected.length === 0) return false;
    const ids = this.clipboard.duplicate(selected, { x: PASTE_STEP, y: PASTE_STEP });
    this.setSelection(selected.map((id) => ids.get(id)).filter((id) => id !== undefined));
    return true;
  }

  /**
   * Copies elements, with what moves with them, offset by `offset` (a paste step by default), as
   * one undo step, as Ctrl+D does without touching the selection. Returns each copied id's new id.
   */
  duplicateElements(
    ids: Iterable<string>,
    offset: Point = { x: PASTE_STEP, y: PASTE_STEP },
  ): Map<string, string> {
    return this.clipboard.duplicate([...ids], offset);
  }

  /** Label, description and hotkey of an element type, or `undefined` if it isn't registered. */
  elementInfo(type: string): ElementInfo | undefined {
    const kind = this.kinds.get(type);
    return kind ? elementInfo(kind, this.keymap) : undefined;
  }

  /** Right-clicks on the canvas (see `ContextMenuRequest`). Returns an unsubscribe function. */
  onContextMenu(listener: (request: ContextMenuRequest) => void): () => void {
    this.contextMenus.add(listener);
    return () => this.contextMenus.delete(listener);
  }

  /** Elements bottom to top, as drawn. */
  elements(): readonly CanvasElement[] {
    return this.scene.elements;
  }

  getElement(id: string): CanvasElement | undefined {
    return this.scene.get(id);
  }

  /** A world rect in screen pixels, relative to the canvas container (for DOM overlays). */
  worldRectToScreen(rect: Rect): Rect {
    return this.camera.worldRectToScreen(rect);
  }

  /** The world area on screen (for rulers and other DOM drawn along the view). */
  visibleWorldRect(): Rect {
    return this.camera.visibleWorldRect();
  }

  /**
   * The frame the rulers measure for the selection (see `CanvasProduct.rulerFrame`), or `null`
   * for the whole canvas. Worked out again after selection and document changes.
   */
  rulerFrame(): Rect | null {
    const frame = this.rulerFrameElement();
    // A turned frame's axes aren't the rulers': they measure the page then.
    return frame && !frame.rotation ? this.kinds.kindOf(frame).bounds(frame) : null;
  }

  /** Where the scope's ruler guides show (a frame's inside it), as the canvas draws them. */
  placedGuides(): readonly PlacedGuide[] {
    this.placedCache ??= placeGuides(this.guides(), (id) => this.scene.get(id), this.kinds);
    return this.placedCache;
  }

  /** The box round where the selected elements show, or `null` with nothing selected. */
  selectionBounds(): Rect | null {
    const rects: Rect[] = [];
    for (const id of this.scene.selection.ids) {
      const el = this.scene.get(id);
      if (el) rects.push(elementBounds(this.kinds.kindOf(el), el));
    }
    return unionRects(rects);
  }

  /**
   * Runs after anything that can move an element on screen: the camera, a resize or a document
   * change. DOM overlays use it to follow an element. Returns an unsubscribe function.
   */
  onViewChange(listener: () => void): () => void {
    return this.viewChanges.subscribe(listener);
  }

  /** Element actions (e.g. a press on a video's play button). Returns an unsubscribe function. */
  onElementAction(listener: (action: ElementAction) => void): () => void {
    this.elementActions.add(listener);
    return () => this.elementActions.delete(listener);
  }

  selectedIds(): string[] {
    return [...this.scene.selection.ids];
  }

  select(ids: Iterable<string>): void {
    this.setSelection(ids);
  }

  /** Deletes elements, with what goes with them, as one undo step. Returns the removed ids. */
  deleteElements(ids: Iterable<string>): string[] {
    const removing = [...this.withMembers(ids, "delete")];
    this.doc.checkpoint();
    return this.removeElements(removing);
  }

  /** Selects a part of the single selected element (see `ToolContext.setPart`); `null` clears it. */
  setSelectedPart(part: string | null): void {
    const selection = this.scene.selection;
    const next = selection.single() ? part : null;
    if (selection.part === next) return;
    selection.part = next;
    this.requestRender();
    this.emitChange();
  }

  /** Opens the text editor on the selected element. Returns `false` if it has no text. */
  editSelection(): boolean {
    const id = this.scene.selection.single();
    const el = id ? this.scene.get(id) : undefined;
    if (el && this.product.editElement?.(el, this.toolContext)) return true;
    if (!el || !this.kinds.kindOf(el).text) return false;
    // A selected part (e.g. a table cell) is edited rather than the element's first text.
    this.textEditor?.start(el.id, this.scene.selection.part);
    return true;
  }

  /** Clears the selection, or returns to the select tool when nothing is selected. */
  cancel(): void {
    if (this.scene.selection.part) this.setSelectedPart(null);
    else if (this.scene.selection.size > 0) this.setSelection([]);
    else this.setTool("select");
  }

  /** Centers the view on an element (keeping the zoom) and selects it. */
  focusElement(id: string): void {
    const el = this.scene.get(id);
    if (!el) return;
    const { x, y, w, h } = elementBounds(this.kinds.kindOf(el), el);
    this.camera.centerOn({ x: x + w / 2, y: y + h / 2 });
    this.setSelection([id]);
    this.onCameraChange();
  }

  /** Fits an element in the view and selects it. */
  zoomToElement(id: string): void {
    const el = this.scene.get(id);
    if (!el) return;
    this.camera.fitRect(elementBounds(this.kinds.kindOf(el), el));
    this.setSelection([id]);
    this.onCameraChange();
  }

  zoomIn(): void {
    this.zoomTo(this.camera.zoom * ZOOM_STEP);
  }

  zoomOut(): void {
    this.zoomTo(this.camera.zoom / ZOOM_STEP);
  }

  zoomTo(zoom: number): void {
    this.camera.zoomAtCenter(zoom);
    this.onCameraChange();
  }

  zoomToFit(): void {
    const bounds = this.scene.contentBounds();
    if (bounds) this.camera.fitRect(bounds);
    else this.camera.reset();
    this.onCameraChange();
  }

  // ── Wiring ────────────────────────────────────────────────────────────

  private createToolContext(): ToolContext<O> {
    return {
      doc: this.doc,
      camera: this.camera,
      kinds: this.kinds,
      service: (def) => this.services.get(def),
      getOptions: () => this.options,
      getSelection: () => this.scene.selection.ids,
      setSelection: (ids) => this.setSelection(ids),
      setTool: (id) => this.setTool(id),
      elementAt: (world) => this.elementAt(world),
      targetAt: (world, deep) => {
        const hit = this.elementAt(world);
        return hit && this.scene.get(this.targetOf(hit.id, { deep }));
      },
      targetOf: (id) => this.targetOf(id),
      getTool: () => this.tool.id,
      elementsInRect: (rect) => this.scene.elementsInRect(rect),
      editText: (id, part) => this.textEditor?.start(id, part),
      editNewText: (el) => this.textEditor?.startDraft(el),
      setPart: (part) => this.setSelectedPart(part),
      getPart: () => this.scene.selection.part,
      setCursor: (cursor) => this.setCursor(cursor),
      setHover: (id) => this.setHover(id),
      setMarquee: (rect) => {
        this.scene.marquee = rect;
        this.requestRender();
      },
      createSnapper: (exclude) => {
        const ids = new Set(exclude);
        return new GestureSnapper({
          targets: () => this.snapTargets(ids),
          zoom: () => this.camera.zoom,
          settings: () => this.snapping,
          show: (feedback) => this.setSnapFeedback(feedback),
        });
      },
      setSnapFeedback: (feedback) => this.setSnapFeedback(feedback),
      setDraft: (el) => {
        this.renderer.setDraft(el);
        this.requestRender();
      },
      setGuide: (guide) => {
        this.renderer.setGuide(guide);
        this.requestRender();
      },
      setFaded: (ids) => {
        this.renderer.setFaded(ids ?? []);
        this.requestRender();
      },
      animateIn: (ids) => {
        this.renderer.animateIn(ids);
        this.requestRender();
      },
      getElement: (id) => this.scene.get(id),
      withMembers: (ids) => this.withMembers(ids, "move"),
      moved: (ids) => this.product.onMoved?.(this.doc, new Set(ids), this.scene.elements),
      duplicate: (ids) => this.clipboard.duplicate(ids, { x: 0, y: 0 }),
      getHover: () => this.scene.hoveredId,
      interactionAt: (world) =>
        findInteraction(this.scene, world, this.camera.zoom, this.shownGuides()),
      guides: () => this.guides(),
      setGuides: (guides) => this.scopeGuides.write(this.scene.scope, guides),
      setActiveGuide: (index) => {
        this.activeGuide = index;
        this.requestRender();
      },
      overRuler: (axis, screen) => this.rulersShown && overRuler(axis, screen),
      autoPan: (screen, onPan) => this.autoPan.update(screen, onPan),
      panBy: (dx, dy) => {
        this.camera.panBy(dx, dy);
        this.onCameraChange();
      },
      activate: (elementId, action) => {
        for (const listener of this.elementActions) listener({ elementId, action });
      },
      requestRender: () => this.requestRender(),
    };
  }

  private createClipboard(clipboard: Clipboard): ElementClipboard<O> {
    return new ElementClipboard(this.clipboardHost, clipboard);
  }

  /** What copy, paste and drops reach of the engine. */
  private get clipboardHost(): ElementClipboardHost<O> {
    return {
      product: this.product,
      doc: this.doc,
      elements: () => this.scene.elements,
      getElement: (id) => this.scene.get(id),
      withMembers: (ids) => this.withMembers(ids, "move"),
      visibleRect: () => this.camera.visibleWorldRect(),
      getOptions: () => this.options,
      select: (ids) => this.setSelection(ids),
      selected: () => [...this.scene.selection.ids],
      remove: (ids) => void this.removeElements(ids),
    };
  }

  /** What exports reach of the engine. */
  private get exportHost(): ExportHost {
    return {
      elementsOf: (area, ids) => {
        if (!ids && area === "board") return [...this.scene.elements];
        const members = this.withMembers(ids ?? this.scene.selection.ids, "move");
        return this.scene.elements.filter((el) => members.has(el.id));
      },
      bounds: (el) => elementBounds(this.kinds.kindOf(el), el),
      rows: (el) => this.kinds.kindOf(el).rows(el),
      createLinks: () => this.product.createLinks?.() ?? [],
      background: this.renderer.background,
      snapshot: (elements, options) => this.renderer.snapshot(elements, options),
    };
  }

  private createTextEditor(container: HTMLElement): TextEditor {
    return new TextEditor(container, this.doc, this.kinds, this.camera, {
      getElement: (id) => this.scene.get(id),
      onStart: (id, part) => {
        this.renderer.setHiddenText({ id, part });
        this.requestRender();
      },
      onEnd: () => {
        this.renderer.setHiddenText(null);
        this.requestRender();
      },
      onCreate: (id) => this.setSelection([id]),
      remove: (id) => this.deleteElements([id]),
    });
  }

  private bindInput(container: HTMLElement, canvas: HTMLCanvasElement): void {
    const pointer = new PointerInput({
      canvas,
      camera: this.camera,
      activeTool: () => this.tool,
      panTool: () => this.tools.get("hand")!,
      setCursor: (cursor) => this.setCursor(cursor),
      setHover: (id) => this.setHover(id),
      onGestureStart: () => {
        // Clicking the canvas ends text editing and moves focus away from inputs.
        this.textEditor?.commit();
        (document.activeElement as HTMLElement | null)?.blur?.();
      },
      onDoubleClick: (p) => this.handleDoubleClick(p),
      onContextMenu: (p) => this.handleContextMenu(p),
    });
    pointer.bind(this.disposables);
    bindWheel(this.disposables, canvas, this.camera, () => this.onCameraChange());
    bindKeyboard(this.disposables, {
      pointer,
      keymap: this.keymap,
      isEditingText: () => this.textEditor?.editingId != null,
      runCommand: (command) => this.commands[command]?.(),
    });

    this.disposables.add(this.doc.observe((change) => this.handleDocumentChange(change)));
    this.disposables.add(this.doc.onHistoryChange(() => this.emitChange()));

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      this.camera.setViewport(width, height);
      this.renderer.resize(width, height);
      this.requestRender();
      this.viewChanges.emit();
    });
    resizeObserver.observe(container);
    this.disposables.add(() => resizeObserver.disconnect());
  }

  // ── Reactions ─────────────────────────────────────────────────────────

  private handleDocumentChange(change: DocumentChange): void {
    this.scopeGuides.invalidate();
    this.rulerFrameCache = null;
    this.placedCache = null;
    const scope = this.nextScope(change);
    if (scope !== this.scene.scope) {
      this.showScope(scope);
      return;
    }
    this.refreshScene();
    // Derived geometry may follow any change, so those elements are redrawn every time; replaced
    // ones only moved in the drawing order or got a new clip.
    const changed = [
      ...new Set([...change.updated, ...this.scene.derivedIds, ...this.scene.replacedIds]),
    ]
      .map((id) => this.scene.get(id))
      .filter((el): el is CanvasElement => el !== undefined);
    // Elements that moved to another scope leave the canvas like removed ones.
    const gone = new Set([
      ...change.removed,
      ...[...change.updated].filter((id) => !this.scene.get(id)),
    ]);
    this.renderer.syncElements(changed, gone);
    this.scene.selection.remove(gone);
    this.textEditor?.reposition();
    this.requestRender();
    this.emitChange();
    this.viewChanges.emit();
  }

  /**
   * The scope to show after a document change: the one an undo or redo changed when it didn't
   * touch the one on screen, else the one on screen while it exists, else the one now in its
   * place in the order.
   */
  private nextScope(change: DocumentChange): string | null {
    const current = this.scene.scope;
    if (!this.scopes) return current;
    const previous = this.scopeList;
    const list = this.scopes.list(this.doc);
    this.scopeList = list;
    if (this.followHistory) {
      const touched = this.touchedScopes(change, new Set(list));
      if (touched.size > 0 && (current === null || !touched.has(current))) {
        const first = list.find((id) => touched.has(id));
        if (first) return first;
      }
    }
    if (current !== null && list.includes(current)) return current;
    const at = current === null ? 0 : Math.max(previous.indexOf(current), 0);
    return list[Math.min(at, list.length - 1)] ?? null;
  }

  /** The scopes a change touched: its elements' (removed ones' as they were) and scopes' own. */
  private touchedScopes(change: DocumentChange, scopes: ReadonlySet<string>): Set<string> {
    const touched = new Set<string>();
    const add = (scope: string | null | undefined) => {
      if (scope) touched.add(scope);
    };
    for (const id of change.updated) {
      const el = this.doc.get(id);
      add(scopes.has(id) ? id : el && this.scopes?.of(el));
    }
    for (const id of change.removed) add(this.scene.scopeIds.get(id));
    return touched;
  }

  /** Puts another scope on screen (see `setScope`); `null` shows nothing. */
  private showScope(scope: string | null): void {
    const left = this.scene.scope;
    if (left !== null) {
      const { x, y, zoom } = this.camera;
      this.scopeViews.set(left, { x, y, zoom });
    }
    const shown = this.scene.elements.map((el) => el.id);
    this.setTool("select");
    this.scene.scope = scope;
    this.scene.selection.set([]);
    this.rulerFrameCache = null;
    this.placedCache = null;
    this.scene.setHover(null);
    this.refreshScene();
    if (!this.rendererReady) {
      this.emitChange();
      return;
    }
    const now = new Set(this.scene.elements.map((el) => el.id));
    this.renderer.syncElements(
      this.scene.elements,
      shown.filter((id) => !now.has(id)),
    );
    const view = scope === null ? undefined : this.scopeViews.get(scope);
    if (view) {
      this.camera.zoom = view.zoom;
      this.camera.x = view.x;
      this.camera.y = view.y;
    } else {
      const content = this.scene.contentBounds();
      if (content) this.camera.fitRect(content);
      else this.camera.reset();
    }
    this.textEditor?.reposition();
    this.onCameraChange();
  }

  /** A font some elements use has loaded: they're measured (`fontsLoaded`) and drawn again. */
  private handleFontLoad(key: string): void {
    const using = this.scene.elements.filter((el) =>
      this.kinds
        .kindOf(el)
        .fonts(el)
        .some((font) => fontKey(font) === key),
    );
    for (const el of using) {
      const patch = this.kinds.kindOf(el).fontsLoaded(el);
      if (patch) this.doc.updateUntracked(el.id, patch);
    }
    if (this.rendererReady) this.renderer.refreshText(using.map((el) => el.id));
    this.requestRender();
  }

  /** What selecting `id` selects (see `CanvasProduct.selectTarget`). */
  private targetOf(id: string, { deep = false, enter = false } = {}): string {
    const request = { selection: this.scene.selection.ids, deep, enter };
    return this.product.selectTarget?.(id, request, this.scene.elements) ?? id;
  }

  /**
   * Double-click enters a group (one level further in), lets the product edit what's hit (e.g. a
   * design vector's points), or edits its text.
   */
  private handleDoubleClick(p: CanvasPointer): void {
    if (this.tool.id !== "select") return;
    const hit = this.elementAt(p.world);
    if (!hit) return;
    const entered = this.targetOf(hit.id, { enter: true });
    if (entered !== this.targetOf(hit.id)) {
      this.setSelection([entered]);
      return;
    }
    if (this.product.editElement?.(hit, this.toolContext)) return;
    const text = this.kinds.kindOf(hit).text;
    if (!text) return;
    this.setSelection([hit.id]);
    this.textEditor?.start(hit.id, text.partAt?.(hit, p.world));
  }

  /** Selects what was right-clicked (locked elements too) and asks the host for its menu. */
  private handleContextMenu(p: CanvasPointer): void {
    this.textEditor?.commit();
    const tolerance = HIT_TOLERANCE_PX / this.camera.zoom;
    const hit = this.scene.elementAt(p.world, tolerance, true);
    const target = hit && this.targetOf(hit.id);
    if (!target) this.setSelection([]);
    else if (!this.scene.selection.has(target)) this.setSelection([target]);
    this.setHover(null);
    const request: ContextMenuRequest = {
      screen: p.screen,
      world: p.world,
      target: hit ? "selection" : "canvas",
    };
    for (const listener of this.contextMenus) listener(request);
  }

  private onCameraChange(): void {
    this.tool.onCameraChange?.();
    this.textEditor?.reposition();
    this.updateTextZoom();
    this.requestRender();
    this.emitChange();
    this.viewChanges.emit();
  }

  /** Applies picked options to the selected elements they're for, as one undo step. */
  private restyleSelection(options: Partial<O>): void {
    const patches = new Map<string, ElementPatch>();
    for (const id of this.scene.selection.ids) {
      const el = this.scene.get(id);
      const patch = el ? this.kinds.kindOf(el).restyle(el, options) : {};
      if (Object.keys(patch).length > 0) patches.set(id, patch);
    }
    if (patches.size === 0) return;
    this.doc.checkpoint();
    this.doc.updateMany(patches);
  }

  /** Deletes the selected part of the single selected element, as one undo step. */
  private deleteSelectedPart(): boolean {
    const { part } = this.scene.selection;
    const id = this.scene.selection.single();
    const el = id ? this.scene.get(id) : undefined;
    if (!el || !part) return false;
    const patch = this.kinds.kindOf(el).removePart(el, part);
    this.setSelectedPart(null);
    if (!patch) return true;
    this.doc.checkpoint();
    this.doc.update(el.id, patch);
    return true;
  }

  // ── State helpers ─────────────────────────────────────────────────────

  /** The ids plus what the product says goes with them when moved or deleted. */
  withMembers(ids: Iterable<string>, purpose: "move" | "delete"): Set<string> {
    const set = new Set(ids);
    return this.product.withMembers?.(set, this.scene.elements, purpose) ?? set;
  }

  /**
   * Removes exactly these elements (in the current undo step) and lets the product clean up
   * after them. Returns the removed ids.
   */
  private removeElements(ids: readonly string[]): string[] {
    const removing = ids.filter((id) => this.doc.get(id));
    if (removing.length === 0) return [];
    const before = this.scene.elements;
    this.doc.batch(() => {
      this.doc.remove(removing);
      this.product.onRemove?.(this.doc, new Set(removing), before);
    });
    return removing;
  }

  /** Waits for the images and fonts of the elements on screen, for at most `CONTENT_TIMEOUT_MS`. */
  private async loadContent(onLoading: (loading: EngineLoading) => void): Promise<void> {
    const elements = this.scene.elements;
    const assets = [...new Set(elements.flatMap((el) => this.kinds.kindOf(el).assets(el)))];
    const loadingFonts = () => onLoading({ stage: "Loading fonts", progress: null });
    const images =
      assets.length === 0
        ? Promise.resolve(loadingFonts())
        : this.renderer
            .preloadImages(assets, (done, total) =>
              onLoading({ stage: "Loading images", progress: { done, total } }),
            )
            .then(loadingFonts);
    await Promise.race([
      Promise.all([images, this.fontTracker.settled()]),
      delay(CONTENT_TIMEOUT_MS),
    ]);
  }

  /** Re-reads the elements, and re-resolves the links between them. */
  private refreshScene(): void {
    this.scene.refresh();
    this.fontTracker.request(this.scene.elements.flatMap((el) => this.kinds.kindOf(el).fonts(el)));
    for (const links of this.links) links.update(this.scene.elements);
  }

  private elementAt(world: Point): CanvasElement | undefined {
    return this.scene.elementAt(world, HIT_TOLERANCE_PX / this.camera.zoom);
  }

  private setSelection(ids: Iterable<string>): void {
    if (!this.scene.selection.set(ids)) return;
    this.rulerFrameCache = null;
    // Show the selected element's style in the options panel.
    const first = this.scene.get([...this.scene.selection.ids][0] ?? "");
    if (first) this.options = { ...this.options, ...this.kinds.kindOf(first).optionsOf(first) };
    this.requestRender();
    this.emitChange();
  }

  private setHover(id: string | null): void {
    if (this.scene.setHover(id)) this.requestRender();
  }

  private setCursor(cursor: string): void {
    if (this.container) this.container.style.cursor = cursor;
  }

  private arrangeItems(ids: Iterable<string>): ArrangeItem[] {
    return arrangeItems(ids, this.arrangeHost);
  }

  private get arrangeHost(): ArrangeHost {
    return {
      get: (id) => this.scene.get(id),
      kinds: this.kinds,
      withMembers: (members) => this.withMembers(members, "move"),
    };
  }

  /** What items line up with: their bounds when there are several, or what holds the one. */
  private alignTargetOf(items: readonly ArrangeItem[]): Rect | null {
    if (items.length > 1) return unionRects(items.map((item) => item.rect));
    const [only] = items;
    const el = only && this.scene.get(only.id);
    return (el && this.product.alignTarget?.(el, this.scene.elements)) ?? null;
  }

  /** Moves by these offsets as a new undo step (none when nothing moves). */
  private arrange(offsets: ReadonlyMap<string, Point>): string[] {
    if (![...offsets.values()].some(({ x, y }) => x !== 0 || y !== 0)) return [];
    this.doc.checkpoint();
    return this.moveElementsBy(offsets);
  }

  private setSnapFeedback(feedback: SnapFeedback | null): void {
    this.renderer.setSnapFeedback(feedback);
    this.requestRender();
  }

  /**
   * What gestures snap to: the outlines (clipped like they're drawn) of the snap targets on and
   * around the screen, but the excluded ids.
   */
  private snapTargets(exclude: ReadonlySet<string>): SnapTargets {
    const view = this.camera.visibleWorldRect();
    const area = { x: view.x - view.w, y: view.y - view.h, w: view.w * 3, h: view.h * 3 };
    const lines: Record<SnapAxis, number[]> = { x: [], y: [] };
    if (this.snapping.guides)
      for (const guide of this.shownGuides())
        // A turned frame's guides don't run along the axes things snap on.
        if (!guide.rotation && !exclude.has(rulerGuideKey(guide.index)) && guideInside(guide))
          lines[guide.axis].push(guide.value);
    const boxes: Rect[] = [];
    if (!this.snapping.objects) return snapTargets(boxes, lines);
    for (const el of this.scene.elements) {
      const kind = this.kinds.kindOf(el);
      if (exclude.has(el.id) || !kind.snapTarget(el)) continue;
      const clip = this.scene.clipOf(el);
      const shown = elementBounds(kind, el);
      const box = clip ? intersectRects(shown, clipBounds(clip)) : shown;
      if ((box.w > 0 || box.h > 0) && rectsIntersect(box, area)) boxes.push(box);
    }
    return snapTargets(boxes, lines);
  }

  /** The ruler guides on screen: none while they're hidden. */
  private shownGuides(): readonly PlacedGuide[] {
    return this.guidesShown ? this.placedGuides() : [];
  }

  /** The element the rulers measure for the selection (see `CanvasProduct.rulerFrame`). */
  private rulerFrameElement(): CanvasElement | null {
    if (this.rulerFrameCache) return this.rulerFrameCache.frame;
    const selected = [...this.scene.selection.ids].map((id) => this.scene.get(id));
    const elements = selected.filter((el) => el !== undefined);
    const frame =
      elements.length > 0 && this.product.rulerFrame
        ? this.product.rulerFrame(elements, this.scene.elements)
        : null;
    this.rulerFrameCache = { frame };
    return frame;
  }

  private requestRender(): void {
    this.frames.request();
  }

  private draw(): void {
    this.renderer.setRulerGuides({
      guides: this.shownGuides(),
      active: this.activeGuide,
      inset: this.rulersShown ? RULER_SIZE : 0,
    });
    const animating = this.renderer.render(
      this.camera,
      this.scene.overlay(this.camera.zoom),
      this.scene.selection.ids,
    );
    if (animating) this.requestRender();
  }

  private buildState(): EngineState<O> {
    return {
      tool: this.tool.id,
      options: this.options,
      zoom: this.camera.zoom,
      selectionCount: this.scene.selection.size,
      selectedIds: this.scene.selection.list(),
      selectedId: this.scene.selection.single() ?? null,
      selectionTypes: this.selectionTypes(),
      selectedPart: this.scene.selection.part,
      snapping: this.snapping,
      guidesShown: this.guidesShown,
      rulersShown: this.rulersShown,
      scope: this.scene.scope,
      canUndo: this.doc.canUndo(),
      canRedo: this.doc.canRedo(),
    };
  }

  /** Sorted, comma-separated types of the selected elements (a primitive, so snapshots compare cheaply). */
  private selectionTypes(): string {
    const types = new Set([...this.scene.selection.ids].map((id) => this.scene.get(id)?.type));
    return [...types].filter(Boolean).sort().join(",");
  }

  /** Publishes a new snapshot; the store only notifies when a field actually changed. */
  private emitChange(): void {
    this.store.set(this.buildState());
  }
}
