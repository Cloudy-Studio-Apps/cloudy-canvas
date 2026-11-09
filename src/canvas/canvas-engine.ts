import {
  fontKey,
  type Clipboard,
  type DroppedFile,
  type GlyphOutliner,
  type WebpEncoder,
  type ColorConversion,
  type PrintProfileInfo,
} from "@shared/core";

import { Camera } from "./camera";
import { CameraGlide } from "./camera-glide";
import {
  nudgeCheckpoint,
  type Alignment,
  type DistributeAxis,
  type RotatePivot,
  type ScaleAnchor,
} from "./arrange";
import { DEFAULT_VIEW_OPTIONS } from "./canvas-view";
import {
  copiedStyle,
  dropFiles,
  ElementClipboard,
  MemoryClipboard,
  PASTE_STEP,
  setCopiedStyle,
  type DropResult,
  type ElementClipboardHost,
} from "./clipboard";
import { createCommands } from "./commands";
import type { Commands } from "./commands.types";
import { CanvasDocument, type DocumentChange, type UndoHistory } from "./document";
import {
  elementBounds,
  elementInfo,
  type CanvasElement,
  type ElementInfo,
  type ElementKinds,
  type ElementPatch,
  type ElementStyle,
  type ReorderDirection,
} from "./elements";
import {
  encodeImage,
  exportElements,
  hasRows,
  PdfBook,
  pdfPageCount,
  renderThumbnail,
  type CaptureAreaOptions,
  type ExportArea,
  type ExportHost,
  type ExportOptions,
  type PdfExportOptions,
  type ThumbnailOptions,
} from "./export";
import { findInteraction } from "./find-interaction";
import type { EngineLoading } from "./engine-loading.types";
import type { EngineState } from "./engine-state.types";
import { rectCenter, rectsIntersect } from "./geometry";
import type { Point, Rect } from "./geometry.types";
import {
  bindKeyboard,
  bindPinch,
  bindWheel,
  EdgeAutoPan,
  Keymap,
  PointerInput,
  SuspendableListeners,
  toCanvasPointer,
} from "./input";
import {
  Renderer,
  watchPixelRatio,
  type CanvasTheme,
  type EffectRenderer,
  type ImageQuality,
} from "./render";
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
import {
  ActorWorkspace,
  type ActorWorkspaceHost,
  type CanvasWorkspace,
  type HistoryTarget,
  type ScratchCopy,
  type WorkspaceInit,
} from "./workspace";
import { productSceneHooks } from "./workspace/scene-hooks";
import {
  alignElements,
  applyStyle,
  applyStyleOf,
  canAlign,
  deleteElements,
  distributeElements,
  elementsBounds,
  moveElementsBy,
  removeElements,
  reorderElements,
  rotateElements,
  scaleElements,
  sceneExportHost,
  setLocked,
  tidyUpElements,
  withMembers,
  type WorkspaceParts,
} from "./workspace/operations";
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
import { fontsChanged } from "./text/rich/font-metrics";
import type { TextSelection } from "./text/rich-editor/rich-editor.types";
import { createBaseTools, type CanvasPointer, type Tool, type ToolContext } from "./tools";
import { GuideDrag } from "./tools/guide-drag";
import { BeforeSaveTasks } from "./before-save-tasks";
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
import { DEFAULT_MODE, modeAllows, modeAllowsCommand, type CanvasMode } from "./modes";
import { t } from "./canvas.i18n";

const ZOOM_STEP = 1.25;
const HIT_TOLERANCE_PX = 4;
/** Text is re-rasterized for the new zoom once zooming settles. */
const TEXT_ZOOM_DELAY_MS = 150;
/** Pixels per world unit of "Copy as PNG". */
const COPY_PNG_SCALE = 2;
/** How long `close()` waits for its tasks before destroying the engine anyway. */
const CLOSE_TIMEOUT_MS = 3000;
/**
 * How long a closing save waits for the `onBeforeSave` tasks: quitting gives all its tasks 5 s,
 * and the save still has to fit after them.
 */
const BEFORE_SAVE_TIMEOUT_MS = 3000;
/** Longest `mount` waits for images and fonts; whatever is still loading pops in later. */
const CONTENT_TIMEOUT_MS = 8000;

/** Why an export copy can't be used: what its preparation set off didn't finish. */
const UNSETTLED_COPY =
  "There are too many nested repeats to make everything for the export in one go, so nothing " +
  "was exported.";

/**
 * Framework-agnostic infinite canvas, shared by every product (boards, designs). Wires the
 * document, camera, renderer, tools and input together; the product it's created with brings the
 * element kinds, tools, keymap and tool options. Hosts call `mount(container)` and drive it through
 * the public methods; UI state is exposed via `subscribe()` / `getState()`. `O` is the product's
 * tool options.
 */
export class CanvasEngine<O extends object = object> implements CanvasWorkspace<O> {
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
  /** What the active tool fades (`ToolContext.setFaded`), on top of what the mode isolates. */
  private toolFaded: string[] = [];
  /** What each overlay covers on screen (`coverElements`), by who asked. */
  private readonly covers = new Map<string, readonly string[]>();
  private mode: CanvasMode = DEFAULT_MODE;
  private readonly renderer: Renderer;
  private readonly scene: Scene;
  private readonly fontTracker: FontTracker;
  private readonly glyphs: GlyphOutliner | null;
  private readonly webp: WebpEncoder | null;
  private readonly color: ColorConversion | null;
  /** What tools (and the product's `editElement`) reach of the engine. */
  private readonly toolContext: ToolContext<O>;
  private readonly services: ServiceCache;
  private readonly clipboard: ElementClipboard<O>;
  private readonly systemClipboard: Clipboard;
  private readonly tools: Map<string, Tool>;
  private readonly store: Store<EngineState<O>>;
  private readonly disposables = new Disposables();
  private readonly frames = new FrameScheduler(() => this.draw());
  /** The input listeners, ignored while suspended (see `setSuspended`). */
  private readonly input = new SuspendableListeners(this.disposables, () => this.isSuspended);
  private isSuspended = false;
  /** Input is bound and drawing may start (the end of `mount`). */
  private started = false;
  private readonly autoPan = new EdgeAutoPan(this.camera, (dx, dy) => {
    this.camera.panBy(dx, dy);
    this.onCameraChange();
  });
  private readonly updateTextZoom = debounce(() => {
    this.renderer.setTextZoom(this.camera.zoom);
    this.requestRender();
  }, TEXT_ZOOM_DELAY_MS);

  private readonly viewChanges = new Emitter();
  /** The person moved the view themselves (see `onUserCamera`). */
  private readonly userCamera = new Emitter();
  private readonly glide = new CameraGlide(this.camera, () => this.onCameraChange());
  /** Other collaborators' contexts on this document, by collaborator id (see `workspace`). */
  private readonly actors = new Map<string, ActorWorkspace<O>>();
  /** Scratch workspaces over forks of the document, with their fork (see `scratchWorkspace`). */
  private readonly scratches = new Map<ActorWorkspace<O>, CanvasDocument>();
  /** Whose history Undo and Redo step through instead of the user's (see `setHistoryTarget`). */
  private historyTarget: HistoryTarget | null = null;
  private stopHistoryTarget: (() => void) | null = null;
  private readonly elementActions = new Set<(action: ElementAction) => void>();
  private readonly contextMenus = new Set<(request: ContextMenuRequest) => void>();
  private readonly hostActions = new Map<string, HostAction>();
  private readonly closeTasks = new Map<string, () => Promise<void>>();
  private readonly beforeSaveTasks = new BeforeSaveTasks();
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
  private toolOptions: O;
  private snapping: SnapSettings;
  private container: HTMLElement | null = null;
  private textEditor: TextEditor | null = null;
  /** The rich text editor's selection, while a rich text is edited. */
  private textSelection: TextSelection | null = null;
  /** The element the rich editor draws as edited (see `previewEdited`). */
  private previewedId: string | null = null;
  private mounted = false;
  private destroyed = false;
  private closing = false;
  private rendererReady = false;

  constructor({
    product,
    theme,
    exportTheme,
    document,
    clipboard,
    fonts,
    glyphs,
    webp,
    color,
  }: CanvasEngineOptions<O>) {
    this.product = product;
    this.productId = product.id;
    this.kinds = product.kinds;
    this.keymap = new Keymap(product.keybindings);
    this.toolOptions = product.defaultOptions;
    this.doc = document ?? new CanvasDocument(this.kinds);
    this.ownsDocument = !document;
    this.services = new ServiceCache(this.doc);
    this.links = product.createLinks?.() ?? [];
    const view = { ...DEFAULT_VIEW_OPTIONS, ...product.view };
    this.view = view;
    this.snapping = view.snapping;
    this.rulersShown = view.rulers;
    this.camera.setZoomLimits(view.minZoom, view.maxZoom);
    const effectRenderers = product.effectRenderers ?? new Map<string, EffectRenderer>();
    this.renderer = new Renderer(
      theme,
      exportTheme ?? theme,
      this.kinds,
      this.links,
      { read: (id) => this.doc.getAsset(id), onLoad: () => this.requestRender() },
      {
        grid: view.grid,
        sizeLabel: view.sizeLabel,
        placement: {
          orderOf: (el, kind) => this.scene.orderKey(el, kind),
          clipOf: (el) => this.scene.clipOf(el),
          masks: () => this.scene.masks,
          effects: () => this.scene.effects,
          effectRenderers,
          drawn: (el) => this.scene.drawn(el),
        },
        // Effects that read what's behind, and scopes that blend with it, need the back buffer.
        backdrop:
          product.effects !== undefined ||
          [...effectRenderers.values()].some((renderer) => !!renderer.backdrop),
      },
    );
    const scopes = product.scopes;
    this.scopes = scopes;
    this.scene = new Scene(this.doc, this.kinds, productSceneHooks(product));
    if (scopes) {
      this.scopeList = scopes.list(this.doc);
      this.scene.scope = this.firstShownScope(this.scopeList);
      // New elements land in the scope on screen.
      this.doc.setPlacement((el) => {
        const scope = this.scene.scope;
        return scope === null ? el : scopes.place(el, scope);
      });
    }
    if (product.afterEdit) this.doc.setAfterEdit(product.afterEdit.bind(product));
    this.scopeGuides = new ScopeGuides(this.doc, product.guides);
    this.glyphs = glyphs ?? null;
    this.webp = webp ?? null;
    this.color = color ?? null;
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

    onLoading({ stage: t("loading.starting"), progress: null });
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
          onLoading({ stage: t("loading.layers"), progress: { done, total } }),
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
    this.started = true;
    if (!this.isSuspended) this.frames.start();
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  /** Whether the engine is suspended: its tab is in the background (see `setSuspended`). */
  get suspended(): boolean {
    return this.isSuspended;
  }

  /**
   * Suspends the engine while its tab is in the background: it draws nothing and ignores keys,
   * clicks, wheel and pinch, while the scene keeps following the document (agents' edits,
   * `workspace(id)`) and resizes keep the camera's viewport. Thumbnails and exports still work.
   * Resuming draws one full frame.
   */
  setSuspended(suspended: boolean): void {
    if (suspended === this.isSuspended || this.destroyed) return;
    this.isSuspended = suspended;
    if (suspended) {
      this.textEditor?.commit();
      this.autoPan.stop();
      this.frames.stop();
      return;
    }
    if (!this.started || this.closing) return;
    this.frames.start();
    this.requestRender();
  }

  /**
   * Removes the assets nothing uses any more, as the product's `assetSweeps` find them (a 3D
   * model's data after it was converted or deleted). Run when a file opens and when it closes:
   * undo could bring the data back before. Returns how many went; nothing happens on a read-only
   * document (a guest's).
   */
  sweepAssets(): number {
    const sweeps = this.product.assetSweeps;
    if (!sweeps || this.doc.isReadOnly) return 0;
    const gone = new Set<string>();
    for (const sweep of sweeps) for (const id of sweep(this.doc, this.kinds)) gone.add(id);
    this.doc.removeAssets(gone);
    return gone.size;
  }

  /**
   * Work to finish before the engine closes (e.g. a thumbnail of the canvas), keyed so setting it
   * again replaces it. It runs in `close()`, while the engine can still draw.
   */
  onClose(key: string, task: () => Promise<void>): void {
    this.closeTasks.set(key, task);
  }

  /**
   * Work that must be written to the document before the file's last save, when the editor or the
   * window closes (a live edit that writes when it finishes), keyed so setting it again replaces
   * it. Returns a function that removes it.
   */
  onBeforeSave(key: string, task: () => Promise<void>): () => void {
    return this.beforeSaveTasks.set(key, task);
  }

  /**
   * Runs the `onBeforeSave` tasks one after another (at most a few seconds). The closing save
   * awaits it, then sweeps the unused assets, then saves.
   */
  finishBeforeSave(): Promise<void> {
    return this.beforeSaveTasks.run(BEFORE_SAVE_TIMEOUT_MS);
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
    this.userCamera.clear();
    this.glide.cancel();
    this.setHistoryTarget(null);
    for (const id of [...this.actors.keys()]) this.dropWorkspace(id);
    for (const workspace of [...this.scratches.keys()]) this.dropScratchWorkspace(workspace);
    this.elementActions.clear();
    this.contextMenus.clear();
    if (this.scopes) this.doc.setPlacement(null);
    if (this.product.afterEdit) this.doc.setAfterEdit(null);
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

  /** The colors the canvas draws with on screen (exports keep `CanvasEngineOptions.exportTheme`). */
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
    // A mode's other tools wait (their shortcuts too) until it's left.
    if (!next || this.tool === next || !modeAllows(this.mode, id)) return;
    this.tool.onCancel?.();
    this.toolFaded = [];
    this.renderer.setSnapFeedback(null);
    this.tool = next;
    // After the switch: a mode's `faded` rule may depend on the tool.
    this.applyFaded();
    this.scene.resizeMode = next.resizeMode ?? "resize";
    this.scene.setHover(null);
    this.setCursor(this.tool.cursor);
    this.tool.onActivate?.();
    this.requestRender();
    this.emitChange();
  }

  /** What the current mode calls `command` (`CanvasMode.commandLabels`), `undefined` when it doesn't rename it. */
  commandLabel(command: string): string | undefined {
    return this.mode.commandLabels?.[command];
  }

  /** The current mode's id (`DEFAULT_MODE`'s when none of the product's is on). */
  get modeId(): string {
    return this.mode.id;
  }

  /**
   * Switches to a mode by id (see `CanvasMode`): its tool comes on and only what it isolates can
   * be reached. Unknown ids are ignored; `DEFAULT_MODE.id` leaves any mode.
   */
  setMode(id: string): void {
    const next =
      id === DEFAULT_MODE.id ? DEFAULT_MODE : this.product.modes?.find((mode) => mode.id === id);
    if (!next || next === this.mode) return;
    this.textEditor?.commit();
    // Leave the old mode's tool first, so the new mode's tool may be any.
    this.mode = DEFAULT_MODE;
    this.setTool(next.tool);
    this.mode = next;
    this.keymap.setLayer(next.keybindings ?? null);
    this.scene.isolation = next.isolate ?? null;
    const kept = [...this.scene.selection.ids].filter((selected) => {
      const el = this.scene.get(selected);
      return el !== undefined && this.scene.reachable(el, true);
    });
    if (kept.length !== this.scene.selection.ids.size) this.setSelection(kept);
    this.scene.setHover(null);
    this.applyFaded();
    this.requestRender();
    this.emitChange();
  }

  /** Whether animated GIFs play (the host keeps the user's choice; on by default). */
  setGifPlayback(enabled: boolean): void {
    this.renderer.setGifPlayback(enabled);
  }

  /** Changes what snaps (the host keeps the user's choice). */
  setSnapping(patch: Partial<SnapSettings>): void {
    this.snapping = { ...this.snapping, ...patch };
    this.emitChange();
  }

  /** Whether the current mode lets this command run (see `CanvasMode.commands`). */
  allowsCommand(command: string): boolean {
    return modeAllowsCommand(this.mode, command);
  }

  /** Whether the active tool handles this command itself (see `Tool.onCommand`). */
  toolTakes(command: string): boolean {
    return this.tool.onCommand?.(command) ?? false;
  }

  setToolOptions(patch: Partial<O>): void {
    this.toolOptions = { ...this.toolOptions, ...patch };
    this.restyleSelection(patch);
    this.emitChange();
  }

  /** Undoes the user's last step, or the history target's while one is set. */
  undo(): void {
    this.stepHistory((history) => history.undo());
  }

  redo(): void {
    this.stepHistory((history) => history.redo());
  }

  canUndo(): boolean {
    return this.activeHistory.canUndo();
  }

  canRedo(): boolean {
    return this.activeHistory.canRedo();
  }

  /**
   * Makes Undo and Redo (commands, buttons, `undo()`) step through someone else's history, e.g.
   * the agent the user follows; `null` goes back to the user's own.
   */
  setHistoryTarget(target: HistoryTarget | null): void {
    if (
      target?.history === this.historyTarget?.history &&
      target?.owner === this.historyTarget?.owner
    )
      return;
    this.stopHistoryTarget?.();
    this.historyTarget = target;
    this.stopHistoryTarget = target ? target.history.onChange(() => this.emitChange()) : null;
    this.emitChange();
  }

  // ── Collaborators' workspaces ─────────────────────────────────────────

  /**
   * The context collaborator `id` (an agent) works in, made the first time on `init` (by default
   * the scope on screen and the user's view): its own scope, selection, view and undo history.
   */
  workspace(id: string, init?: Partial<WorkspaceInit>): ActorWorkspace<O> {
    const existing = this.actors.get(id);
    if (existing) return existing;
    const workspace = new ActorWorkspace(this.actorHost, Symbol(`actor:${id}`), {
      // A collaborator never starts on a background scope (a feature's hidden page).
      scope: init?.scope ?? this.shownScopeOr(this.scene.scope),
      viewport: init?.viewport ?? this.camera.visibleWorldRect(),
    });
    this.actors.set(id, workspace);
    return workspace;
  }

  /**
   * A headless workspace over `doc`, a fork of this engine's document (`CanvasDocument.fork`):
   * the product's after-edit hook runs on it, so its edits bring syncs along as the user's do, and
   * its exports draw with this engine's renderer, reading the fork's pictures. It's never listed
   * with collaborators'; the caller drops it (`dropScratchWorkspace`), then destroys the fork. The
   * engine drops it too when it's destroyed, and its exports fail from then on.
   */
  scratchWorkspace(doc: CanvasDocument, init?: Partial<WorkspaceInit>): ActorWorkspace<O> {
    if (this.product.afterEdit) doc.setAfterEdit(this.product.afterEdit.bind(this.product));
    const workspace = new ActorWorkspace(
      this.actorHostFor(doc, () => []),
      Symbol("scratch"),
      {
        scope: init?.scope ?? this.shownScopeOr(this.scene.scope),
        viewport: init?.viewport ?? this.camera.visibleWorldRect(),
      },
    );
    this.scratches.set(workspace, doc);
    return workspace;
  }

  needsExportCopy(): boolean {
    return this.product.exportCopy?.needed(this.doc) ?? false;
  }

  exportCopy(): ScratchCopy<O> {
    return this.makeExportCopy({ scope: this.scene.scope });
  }

  /**
   * A fork of the document with a scratch workspace over it, opening on `init`, readied by the
   * product (`CanvasProduct.exportCopy`) in one transaction of its workspace's document. Throws
   * (the fork disposed) when the after-edit passes that follow the preparation ran out
   * (`CanvasDocument.settled`): an export never prints something half made.
   */
  private makeExportCopy(init: Partial<WorkspaceInit>): ScratchCopy<O> {
    const doc = this.doc.fork();
    const workspace = this.scratchWorkspace(doc, init);
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      this.dropScratchWorkspace(workspace);
      doc.destroy();
    };
    const prepare = this.product.exportCopy?.prepare;
    try {
      if (prepare) workspace.doc.batch(() => prepare(workspace.doc));
      // What follows from the preparation was cut short: never export it half made.
      if (!doc.settled()) throw new Error(UNSETTLED_COPY);
    } catch (error) {
      dispose();
      throw error;
    }
    return { workspace, doc, dispose };
  }

  /** Destroys a scratch workspace and takes the product's after-edit hook off its fork. */
  dropScratchWorkspace(workspace: ActorWorkspace<O>): void {
    const doc = this.scratches.get(workspace);
    if (!doc) return;
    this.scratches.delete(workspace);
    workspace.destroy();
    doc.setAfterEdit(null);
  }

  /** Collaborator `id`'s workspace, if it has one. */
  findWorkspace(id: string): ActorWorkspace<O> | undefined {
    return this.actors.get(id);
  }

  /** Forgets collaborator `id`'s workspace (it left); its undo history goes with it. */
  dropWorkspace(id: string): void {
    const workspace = this.actors.get(id);
    if (!workspace) return;
    if (this.historyTarget?.history === workspace.history) this.setHistoryTarget(null);
    workspace.destroy();
    this.actors.delete(id);
  }

  /** What the user has selected (the engine is the user's workspace). */
  userSelection(): string[] {
    return this.selectedIds();
  }

  /** The tool options new elements take. */
  options(): O {
    return this.toolOptions;
  }

  /** A scope's name for people (a design's page name), or `null` without one. */
  scopeLabel(scope: string | null): string | null {
    return scope === null ? null : (this.scopes?.label?.(this.doc, scope) ?? null);
  }

  /** The scope an element is shown in (`CanvasScopes.of`), or `null` without scopes. */
  scopeOf(el: CanvasElement): string | null {
    return this.scopes?.of(el) ?? null;
  }

  /**
   * The top-level element `id` is drawn in (`CanvasProduct.rootOf`; itself without one), or
   * `null` when it isn't an element.
   */
  rootOf(id: string): string | null {
    if (this.product.rootOf) return this.product.rootOf(this.doc, id);
    return this.doc.get(id) ? id : null;
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

  /** Selects every element that isn't locked (nor isolated away). */
  selectAll(): void {
    this.setSelection(
      this.scene.elements.filter((el) => this.scene.reachable(el)).map((el) => el.id),
    );
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
    const at = this.clientToWorld(client);
    // Nothing lands on a background scope (a feature's hidden page): only it adds there.
    const scope = this.scene.scope;
    if (!at || (scope !== null && this.isBackground(scope))) {
      return { added: [], skipped: files.map((file) => file.name) };
    }
    this.textEditor?.commit();
    return dropFiles(this.clipboardHost, files, at);
  }

  /** The world point under `client` (client pixels), or `null` outside the canvas. */
  clientToWorld(client: Point): Point | null {
    if (!this.container) return null;
    const box = this.container.getBoundingClientRect();
    const inside =
      client.x >= box.left &&
      client.x <= box.right &&
      client.y >= box.top &&
      client.y <= box.bottom;
    if (!inside) return null;
    return this.camera.screenToWorld({ x: client.x - box.left, y: client.y - box.top });
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
    await this.copyPng(this.exportHost, ids);
  }

  /**
   * Copies the selection (with what moves with it) to the clipboard as SVG text. Rejects with a
   * message for the user when nothing is selected or it can't be copied.
   */
  async copyAsSvg(ids?: readonly string[]): Promise<void> {
    if ((ids?.length ?? this.scene.selection.size) === 0) {
      throw new Error("Select something to copy.");
    }
    this.textEditor?.commit();
    await this.copySvg(this.exportHost, ids);
  }

  /**
   * Exports the selection (with what moves with it) or the whole canvas as an image, a PDF page
   * or CSV. Rejects with a message for the user when there's nothing to export.
   */
  exportElements(options: ExportOptions): Promise<Blob> {
    this.textEditor?.commit();
    return exportElements(this.exportHost, options);
  }

  /** Reads a print profile (`.icc`), rejecting with a message when it isn't a CMYK one. */
  async readPrintProfile(profile: Uint8Array): Promise<PrintProfileInfo> {
    if (!this.color) throw new Error("Color management isn't available here.");
    return this.color.readProfile(profile);
  }

  /** A PDF written a page at a time, reading the canvas as each page is added. */
  pdfBook(options: Partial<PdfExportOptions> = {}): PdfBook {
    this.textEditor?.commit();
    return new PdfBook({ ...options, host: () => this.exportHost });
  }

  /** A small JPEG of the whole canvas for file previews, or `null` when it's empty. */
  thumbnail(options: ThumbnailOptions): Promise<Blob | null> {
    if (!this.rendererReady) return Promise.resolve(null);
    const host = this.exportHost;
    return renderThumbnail(
      {
        elementsOf: host.elementsOf,
        bounds: host.bounds,
        background: host.background,
        capture: (rect, scale) => {
          const canvas = this.renderer.captureView(rect, { scale, background: host.background });
          this.requestRender();
          return canvas;
        },
      },
      options,
    );
  }

  /**
   * A JPEG of a world area exactly as the scope on screen shows it (everything drawn there, at
   * rest), drawn from the views already built like `thumbnail` (about a frame, nothing rebuilt)
   * and encoded off the UI thread; `null` before the canvas can draw. Elements of other scopes
   * aren't in it: draw those with `exportElements`.
   */
  captureArea(
    rect: Rect,
    { scale, unfaded, quality = 0.85 }: CaptureAreaOptions,
  ): Promise<Blob | null> {
    if (!this.rendererReady) return Promise.resolve(null);
    const canvas = this.renderer.captureView(rect, {
      scale,
      background: this.exportHost.background,
      unfaded,
    });
    this.requestRender();
    return encodeImage(canvas, "image/jpeg", quality);
  }

  /** How many pages an area's PDF has with one for each of the product's frames. */
  pdfPageCount(area: ExportArea): number {
    return pdfPageCount(this.exportHost, area);
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
    return reorderElements(this.parts, ids, direction);
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
    return setLocked(this.parts, ids, locked);
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
    return moveElementsBy(this.parts, offsets);
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
    return alignElements(this.parts, ids, alignment);
  }

  /** Whether these elements can be aligned: several of them, or one inside something. */
  canAlign(ids: Iterable<string>): boolean {
    return canAlign(this.parts, ids);
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
    return rotateElements(this.parts, ids, degrees, around);
  }

  /**
   * Scales elements and their content (fonts, strokes, radii, what moves with them) by `factor`
   * round `anchor` of the box round them, as the Scale tool does, in one undo step. Locked ones
   * stay. Returns the scaled ids.
   */
  scaleElements(ids: Iterable<string>, factor: number, anchor: ScaleAnchor = "top-left"): string[] {
    return scaleElements(this.parts, ids, factor, anchor);
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
    return distributeElements(this.parts, ids, axis);
  }

  /** Tidies the selection into a grid with even spacing, as one undo step. */
  tidyUpSelection(): boolean {
    if (this.scene.selection.size === 0) return false;
    this.tidyUpElements(this.scene.selection.ids);
    return true;
  }

  /** Tidies elements into rows and columns, with what moves with them. Returns the moved ids. */
  tidyUpElements(ids: Iterable<string>): string[] {
    return tidyUpElements(this.parts, ids);
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

  /**
   * Takes the look of the selected element (the first of several) for Paste properties (see
   * `ElementKind.styleFields`). Returns `false` when there's nothing to take.
   */
  copyStyle(): boolean {
    const first = this.scene.selection.ids.values().next().value;
    const el = first === undefined ? undefined : this.scene.get(first);
    if (!el) return false;
    const style = this.kinds.kindOf(el).styleOf(el);
    if (Object.keys(style).length === 0) return false;
    setCopiedStyle(this.productId, style);
    return true;
  }

  /** Whether Copy properties took a look Paste properties can apply (in any file of the product). */
  hasCopiedStyle(): boolean {
    return copiedStyle(this.productId) !== null;
  }

  /**
   * Applies the copied look to the selection (or `ids`), locked elements left out, as one undo
   * step. Returns the ids that changed.
   */
  pasteStyle(ids: Iterable<string> = this.scene.selection.ids): string[] {
    const style = copiedStyle(this.productId);
    return style ? this.applyStyle(style, ids) : [];
  }

  /**
   * Applies the look of `fromId` to `ids` as Paste properties does, without touching what Copy
   * properties took (agents). Returns the ids that changed.
   */
  applyStyleOf(fromId: string, ids: Iterable<string>): string[] {
    return applyStyleOf(this.parts, fromId, ids);
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
    return this.elementsBounds(this.scene.selection.ids);
  }

  /** The box round where these elements show, or `null` when none of them is in the scope. */
  elementsBounds(ids: Iterable<string>): Rect | null {
    return elementsBounds(this.parts, ids);
  }

  /** The box round every element of the scope on screen, or `null` when it's empty. */
  contentBounds(): Rect | null {
    return this.scene.contentBounds();
  }

  /**
   * Runs after anything that can move an element on screen: the camera, a resize or a document
   * change. DOM overlays use it to follow an element. Returns an unsubscribe function.
   */
  onViewChange(listener: () => void): () => void {
    return this.viewChanges.subscribe(listener);
  }

  /**
   * How sharp the canvas shows a picture now: its own size, the smaller copy drawn while it looks
   * small on screen (sharper ones follow as it's zoomed into) and how large it shows. Exports draw
   * from the original. `null` before the picture's size is known.
   */
  imageQuality(assetId: string): ImageQuality | null {
    return this.renderer.imageQuality(assetId);
  }

  /** Runs when a picture's canvas texture changes (see `imageQuality`). */
  onImagesChange(listener: () => void): () => void {
    return this.renderer.onImagesChange(listener);
  }

  /**
   * Runs when the person moves the view themselves (scrolling, zooming with the wheel, panning),
   * never for moves the app makes (fits, glides, agents): following someone stops then.
   */
  onUserCamera(listener: () => void): () => void {
    return this.userCamera.subscribe(listener);
  }

  /** Moves the camera to show `area` exactly (a collaborator's view), gliding unless told not to. */
  showViewport(area: Rect, { animate = true }: { animate?: boolean } = {}): void {
    this.glide.start(area, animate);
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
    return deleteElements(this.parts, ids);
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

  /**
   * The rich text being edited (`ElementText.rich`): its text and runs so far and the selection,
   * or `null`. Panels read it to show and restyle the selected range.
   */
  editingText(): ReturnType<TextEditor["richContent"]> {
    return this.textEditor?.richContent() ?? null;
  }

  /**
   * Sets a style over the selection of the rich text being edited (with only a caret, on what's
   * typed next). Returns `false` when no rich text is being edited.
   */
  styleTextRange(patch: object): boolean {
    return this.textEditor?.applyRichStyle(patch) ?? false;
  }

  /**
   * Enter: edits the selected element (its text, or what the product edits), else selects the
   * selection's children. Returns `false` when it did neither.
   */
  editSelection(): boolean {
    const id = this.scene.selection.single();
    const el = id ? this.scene.get(id) : undefined;
    if (el && this.product.editElement?.(el, this.toolContext)) return true;
    if (!el || !this.kinds.kindOf(el).text) return this.selectChildren();
    // A selected part (e.g. a table cell) is edited rather than the element's first text.
    this.textEditor?.start(el.id, this.scene.selection.part);
    return true;
  }

  /** Selects the children of the selection (`layerTree`). Returns `false` when it has none. */
  selectChildren(): boolean {
    const tree = this.product.layerTree;
    if (!tree) return false;
    const elements = this.scene.elements;
    const children = [...this.scene.selection.ids]
      .flatMap((id) => tree.childrenOf(id, elements))
      .filter((id) => this.selectable(id));
    if (children.length === 0) return false;
    this.setSelection(children);
    return true;
  }

  /** Shift+Enter: selects the parents of the selection. Returns `false` when it has none. */
  selectParent(): boolean {
    const tree = this.product.layerTree;
    if (!tree) return false;
    const parents = new Set<string>();
    for (const id of this.scene.selection.ids) {
      const el = this.scene.get(id);
      const parent = el ? tree.parentOf(el) : null;
      if (parent && this.selectable(parent)) parents.add(parent);
    }
    if (parents.size === 0) return false;
    this.setSelection(parents);
    return true;
  }

  /** Whether an element on the canvas can be selected (not locked, nor isolated away). */
  private selectable(id: string): boolean {
    const el = this.scene.get(id);
    return el !== undefined && this.scene.reachable(el);
  }

  /** Clears the selection, or returns to the select tool when nothing is selected. */
  /** Esc: drops the selected part, then the selection, then goes back to the mode's tool, then leaves the mode. */
  cancel(): void {
    if (this.scene.selection.part) this.setSelectedPart(null);
    else if (this.scene.selection.size > 0) this.setSelection([]);
    else if (this.tool.id !== this.mode.tool) this.setTool(this.mode.tool);
    else this.setMode(DEFAULT_MODE.id);
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

  /**
   * Pans by a screen-space delta: e.g. what keeps the content still on screen when the canvas's
   * edge moves because a panel beside it opened or closed.
   */
  panBy(dx: number, dy: number): void {
    this.camera.panBy(dx, dy);
    this.onCameraChange();
  }

  /**
   * Reads these elements again, with what derives from them, and redraws them, though the
   * document didn't change: e.g. a text's glyph outlines arrived, so the booleans and masks made
   * of it are worked out again.
   */
  refreshElements(ids: Iterable<string>): void {
    const updated = new Set(ids);
    this.handleDocumentChange({ updated, removed: new Set() }, updated);
  }

  /** Glides the view, at its zoom, so the canvas's origin (0, 0) is in the middle of the screen. */
  centerOrigin(): void {
    const { w, h } = this.camera.visibleWorldRect();
    this.showViewport({ x: -w / 2, y: -h / 2, w, h });
  }

  zoomToFit(): void {
    const bounds = this.scene.contentBounds();
    if (bounds) this.camera.fitRect(bounds);
    else this.camera.reset();
    this.onCameraChange();
  }

  /**
   * Has elements an edit just moved glide to their new place from where they were: `offsets` are
   * how far each moved (ids not on screen are ignored; nothing with reduced motion).
   */
  animateMoves(offsets: ReadonlyMap<string, Point>): void {
    this.renderer.animateMoves(offsets);
    this.requestRender();
  }

  /** Fits the selection in the view, zooming past 100% if it's small (Figma's Shift+2). */
  zoomToSelection(): void {
    const bounds = this.selectionBounds();
    if (!bounds) return this.zoomToFit();
    this.camera.fitRect(bounds, { maxZoom: Infinity });
    this.onCameraChange();
  }

  /**
   * Fits and selects the next (`1`) or previous (`-1`) of the product's frames (see
   * `CanvasProduct.frames`), after the selected one or the one holding the selection; with
   * neither, the one nearest the middle of the view. Returns `false` when there are none.
   */
  zoomToFrame(step: 1 | -1): boolean {
    const frames = this.product.frames?.(this.scene.elements) ?? [];
    if (frames.length === 0) return false;
    const current = this.currentFrameIndex(frames);
    const index =
      current === null
        ? this.nearestFrameIndex(frames)
        : (current + step + frames.length) % frames.length;
    const frame = frames[index]!;
    this.camera.fitRect(elementBounds(this.kinds.kindOf(frame), frame), { maxZoom: Infinity });
    this.setSelection([frame.id]);
    this.onCameraChange();
    return true;
  }

  // ── Wiring ────────────────────────────────────────────────────────────

  private createToolContext(): ToolContext<O> {
    return {
      doc: this.doc,
      camera: this.camera,
      kinds: this.kinds,
      service: (def) => this.services.get(def),
      getOptions: () => this.toolOptions,
      getSelection: () => this.scene.selection.ids,
      setSelection: (ids) => this.setSelection(ids),
      setTool: (id) => this.setTool(id),
      elementAt: (world) => this.elementAt(world),
      targetAt: (world, deep, background = false) => {
        const hit = this.elementAt(world);
        const target = hit && this.pressTarget(hit.id, deep, background ? world : undefined);
        return target ? this.scene.get(target) : undefined;
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
        this.toolFaded = [...(ids ?? [])];
        this.applyFaded();
        this.requestRender();
      },
      getMode: () => this.mode.id,
      getScope: () => this.scope,
      setMode: (id) => this.setMode(id),
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
        this.onUserCameraChange();
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
      getOptions: () => this.toolOptions,
      select: (ids) => this.setSelection(ids),
      selected: () => [...this.scene.selection.ids],
      remove: (ids) => void this.removeElements(ids),
    };
  }

  /** What exports reach of the engine. */
  private get exportHost(): ExportHost {
    return this.exportHostFor(this.scene, () => this.scene.selection.ids);
  }

  /** What exports of `scene` reach: its elements and the renderer's off-screen snapshot. */
  private exportHostFor(
    scene: Scene,
    selected: () => Iterable<string>,
    doc: CanvasDocument = this.doc,
  ): ExportHost {
    // Another scene than the canvas's (a collaborator's page, a scratch copy) draws with its own
    // stacking, masks and effects: its elements may not be on the canvas at all.
    const placement = scene === this.scene ? undefined : scene.placement();
    // A fork's pictures are read from the fork (the canvas's image cache never takes them).
    const readAsset = doc === this.doc ? undefined : (id: string) => doc.getAsset(id);
    const drawn = { placement, readAsset };
    return sceneExportHost(
      { doc, kinds: this.kinds, product: this.product, scene },
      {
        selected,
        background: this.renderer.exportBackground,
        snapshot: (elements, options) =>
          this.whileOpen(() => this.renderer.snapshot(elements, { ...drawn, ...options })),
        vector: (elements, options) =>
          this.whileOpen(() =>
            this.renderer.vectorSnapshot(elements, { ...drawn, ...options, glyphs: this.glyphs }),
          ),
        webp: this.webp,
        color: this.color,
      },
    );
  }

  /** Runs a draw that needs the renderer, refused once the engine is destroyed. */
  private whileOpen<T>(draw: () => Promise<T>): Promise<T> {
    if (this.destroyed) return Promise.reject(new Error("The canvas was closed."));
    return draw();
  }

  private createTextEditor(container: HTMLElement): TextEditor {
    return new TextEditor(container, this.doc, this.kinds, this.camera, {
      getElement: (id) => this.scene.get(id),
      onStart: (id, part, rich) => {
        if (!rich) this.renderer.setHiddenText({ id, part });
        this.requestRender();
      },
      onEnd: () => {
        this.renderer.setHiddenText(null);
        this.requestRender();
      },
      preview: (el, draft) => this.previewEdited(el, draft),
      onSelection: (selection) => {
        this.textSelection = selection;
        this.emitChange();
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
      onCameraChange: () => this.onUserCameraChange(),
    });
    pointer.bind(this.input);
    bindWheel(this.input, canvas, this.camera, () => this.onUserCameraChange());
    bindPinch(this.input, canvas, this.camera, () => this.onUserCameraChange());
    bindKeyboard(this.input, {
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
      // Resizing clears the canvas: drawing now, before the browser paints (observers run after
      // layout), keeps it from showing a blank frame while a docked panel opens or closes.
      // Suspended, frames are stopped: the camera follows, and resuming draws.
      this.frames.flush();
      this.viewChanges.emit();
    });
    resizeObserver.observe(container);
    this.disposables.add(() => resizeObserver.disconnect());

    // Pixi rebuilds its GL objects; the engine renders on demand, so nothing would draw them.
    const contextRestored = () => {
      this.refreshElements(this.scene.elements.map((el) => el.id));
      this.requestRender();
    };
    canvas.addEventListener("webglcontextrestored", contextRestored);
    this.disposables.add(() => canvas.removeEventListener("webglcontextrestored", contextRestored));

    watchPixelRatio(this.disposables, (ratio) => {
      this.renderer.setPixelRatio(ratio);
      this.renderer.setTextZoom(this.camera.zoom);
      this.frames.flush();
      this.viewChanges.emit();
    });
  }

  // ── Reactions ─────────────────────────────────────────────────────────

  /** Redraws what a change touched; `redraw` ids are drawn again even if they only moved. */
  private handleDocumentChange(change: DocumentChange, redraw?: ReadonlySet<string>): void {
    this.scopeGuides.invalidate();
    this.rulerFrameCache = null;
    this.placedCache = null;
    const scope = this.nextScope(change);
    if (scope !== this.scene.scope) {
      this.showScope(scope);
      return;
    }
    this.refreshScene(change.updated);
    // Derived geometry may follow any change, so derived elements that resolved differently are
    // synced too; replaced ones only moved in the drawing order or got a new clip.
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
    this.renderer.syncElements(changed, gone, redraw);
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
      // Background scopes (a feature's hidden page) are never followed to.
      for (const id of touched) if (this.isBackground(id)) touched.delete(id);
      if (touched.size > 0 && (current === null || !touched.has(current))) {
        const first = list.find((id) => touched.has(id));
        if (first) return first;
      }
    }
    if (current !== null && list.includes(current)) return current;
    const shown = list.filter((id) => !this.isBackground(id));
    const at = current === null ? 0 : Math.max(previous.indexOf(current), 0);
    return shown[Math.min(at, shown.length - 1)] ?? null;
  }

  /** Whether the canvas never goes to this scope on its own (see `CanvasScopes.background`). */
  private isBackground(scope: string): boolean {
    return this.scopes?.background?.(this.doc, scope) ?? false;
  }

  /** `scope`, or the first shown scope when it's a background one. */
  private shownScopeOr(scope: string | null): string | null {
    if (scope === null || !this.isBackground(scope)) return scope;
    return this.firstShownScope(this.scopes?.list(this.doc) ?? []);
  }

  /** The scope the canvas opens on: the first one that isn't a background scope. */
  private firstShownScope(list: readonly string[]): string | null {
    return list.find((id) => !this.isBackground(id)) ?? null;
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
    fontsChanged();
    for (const el of using) {
      const patch = this.kinds.kindOf(el).fontsLoaded(el);
      if (patch) this.doc.updateUntracked(el.id, patch);
    }
    if (this.rendererReady) {
      const ids = using.map((el) => el.id);
      this.renderer.refreshText(ids);
      // Texts laid out by the engine (rich texts) are laid out and drawn again.
      this.refreshElements(ids);
    }
    this.requestRender();
  }

  /**
   * What a press on `id` picks (see `CanvasProduct.selectTarget`); given `world`, `null` may say
   * it's on a background, which picks nothing, so the press starts a selection box.
   */
  private pressTarget(id: string, deep: boolean, world?: Point): string | null {
    const selection = this.scene.selection.ids;
    const request = { selection, deep, enter: false, ...(world ? { world } : {}) };
    const target = this.product.selectTarget?.(id, request, this.scene.elements);
    return target === undefined ? id : target;
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
    if (!this.tool.editsOnDoubleClick) return;
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

  /** Restyles the unlocked elements among `ids` with `style`, as one undo step. */
  private applyStyle(style: ElementStyle, ids: Iterable<string>): string[] {
    return applyStyle(this.parts, style, ids);
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
    return withMembers(this.parts, ids, purpose);
  }

  /** What the shared workspace operations work on: the user's document and scene. */
  private get parts(): WorkspaceParts<O> {
    return { doc: this.doc, kinds: this.kinds, product: this.product, scene: this.scene };
  }

  /**
   * Removes exactly these elements (in the current undo step) and lets the product clean up
   * after them. Returns the removed ids.
   */
  private removeElements(ids: readonly string[]): string[] {
    return removeElements(this.parts, ids);
  }

  /** Waits for the images and fonts of the elements on screen, for at most `CONTENT_TIMEOUT_MS`. */
  private async loadContent(onLoading: (loading: EngineLoading) => void): Promise<void> {
    const elements = this.scene.elements;
    const assets = [...new Set(elements.flatMap((el) => this.kinds.kindOf(el).assets(el)))];
    const loadingFonts = () => onLoading({ stage: t("loading.fonts"), progress: null });
    const images =
      assets.length === 0
        ? Promise.resolve(loadingFonts())
        : this.renderer
            .preloadImages(assets, (done, total) =>
              onLoading({ stage: t("loading.images"), progress: { done, total } }),
            )
            .then(loadingFonts);
    await Promise.race([
      Promise.all([images, this.fontTracker.settled()]),
      delay(CONTENT_TIMEOUT_MS),
    ]);
  }

  /**
   * Hides elements on this engine's canvas while an overlay edits them in their place (a model's
   * live 3D view): `source` names the overlay, `ids` what it covers (`[]` uncovers). Only the
   * on-screen canvas: exports, copies, agents' pictures and file previews still show them.
   */
  coverElements(source: string, ids: readonly string[]): void {
    if (ids.length === 0) this.covers.delete(source);
    else this.covers.set(source, ids);
    this.renderer.setCovered([...this.covers.values()].flat());
    this.requestRender();
  }

  /** Re-reads the elements, and re-resolves the links between them. */
  /**
   * Dims what the tool fades (`setFaded`) and what the mode dims: its `faded` rule, else what its
   * isolation leaves out.
   */
  private applyFaded(): void {
    this.renderer.setFaded([...this.toolFaded, ...this.modeFaded()]);
  }

  private modeFaded(): Iterable<string> {
    const { elements, isolation } = this.scene;
    if (this.mode.faded) {
      return this.mode.faded({ elements, doc: this.doc, tool: this.tool.id, scope: this.scope });
    }
    return isolation ? elements.filter((el) => !isolation(el)).map((el) => el.id) : [];
  }

  /** Reads the scene again; `changed` limits the fonts asked for to those elements' (a change). */
  private refreshScene(changed?: ReadonlySet<string>): void {
    this.scene.refresh();
    if (this.scene.isolation || this.mode.faded) this.applyFaded();
    const elements = changed
      ? [...changed].map((id) => this.scene.get(id)).filter((el) => el !== undefined)
      : this.scene.elements;
    this.fontTracker.request(elements.flatMap((el) => this.kinds.kindOf(el).fonts(el)));
    for (const links of this.links) links.update(this.scene.elements);
  }

  /** The topmost element a press at `world` would hit (locked ones are skipped). */
  elementAt(world: Point): CanvasElement | undefined {
    return this.scene.elementAt(world, HIT_TOLERANCE_PX / this.camera.zoom);
  }

  private setSelection(ids: Iterable<string>): void {
    const next = [...ids];
    // Selecting something else ends editing the text being edited.
    const editing = this.textEditor?.editingId;
    if (editing && !next.includes(editing)) this.textEditor?.commit();
    if (!this.scene.selection.set(next)) return;
    this.rulerFrameCache = null;
    // Show the selected element's style in the options panel.
    const first = this.scene.get([...this.scene.selection.ids][0] ?? "");
    if (first)
      this.toolOptions = { ...this.toolOptions, ...this.kinds.kindOf(first).optionsOf(first) };
    this.requestRender();
    this.emitChange();
  }

  /** Draws an element as the rich editor has it, or as the document has it again (`null`). */
  private previewEdited(el: CanvasElement | null, draft: boolean): void {
    if (draft) {
      this.renderer.setDraft(el);
    } else if (el) {
      this.previewedId = el.id;
      this.renderer.previewElement(el);
    } else if (this.previewedId) {
      const real = this.scene.get(this.previewedId);
      this.previewedId = null;
      if (real) this.renderer.previewElement(real);
    }
    this.requestRender();
  }

  private setHover(id: string | null): void {
    if (this.scene.setHover(id)) this.requestRender();
  }

  private setCursor(cursor: string): void {
    if (this.container) this.container.style.cursor = cursor;
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
      if (exclude.has(el.id) || !kind.snapTarget(el) || !this.scene.drawn(el)) continue;
      const box = this.scene.shownBounds(el);
      if ((box.w > 0 || box.h > 0) && rectsIntersect(box, area)) boxes.push(box);
    }
    return snapTargets(boxes, lines);
  }

  /** The ruler guides on screen: none while they're hidden. */
  private shownGuides(): readonly PlacedGuide[] {
    return this.guidesShown ? this.placedGuides() : [];
  }

  /** The frame that's selected or holds the selection (its first element), or `null`. */
  private currentFrameIndex(frames: readonly CanvasElement[]): number | null {
    const first = this.scene.selection.ids.values().next().value;
    if (first === undefined) return null;
    const selected = frames.findIndex((frame) => frame.id === first);
    if (selected >= 0) return selected;
    const holding = frames.findIndex((frame) => this.withMembers([frame.id], "move").has(first));
    return holding >= 0 ? holding : null;
  }

  /** The frame whose middle is nearest the middle of the view. */
  private nearestFrameIndex(frames: readonly CanvasElement[]): number {
    const view = rectCenter(this.camera.visibleWorldRect());
    let nearest = 0;
    let best = Infinity;
    frames.forEach((frame, index) => {
      const center = rectCenter(elementBounds(this.kinds.kindOf(frame), frame));
      const distance = Math.hypot(center.x - view.x, center.y - view.y);
      if (distance < best) [nearest, best] = [index, distance];
    });
    return nearest;
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

  /** The history Undo and Redo step through: the target's while one is set, else the user's. */
  private get activeHistory(): UndoHistory {
    return this.historyTarget?.history ?? this.doc.history;
  }

  private stepHistory(step: (history: UndoHistory) => void): void {
    this.textEditor?.commit();
    this.followHistory = true;
    try {
      step(this.activeHistory);
    } finally {
      this.followHistory = false;
    }
  }

  private onUserCameraChange(): void {
    this.glide.cancel();
    this.onCameraChange();
    this.userCamera.emit();
  }

  /** Copies elements of an export host to the system clipboard as SVG text, with no margin. */
  private async copySvg(host: ExportHost, ids: readonly string[] | undefined): Promise<void> {
    const svg = await exportElements(host, {
      format: "svg",
      background: "transparent",
      area: "selection",
      ids,
      padding: 0,
    });
    await this.systemClipboard.writeText(await svg.text());
  }

  /** Copies elements of an export host to the system clipboard as a PNG, with no margin. */
  private async copyPng(host: ExportHost, ids: readonly string[] | undefined): Promise<void> {
    const options = { format: "png", background: "transparent", area: "selection", ids } as const;
    const png = await exportElements(host, { ...options, scale: COPY_PNG_SCALE, padding: 0 });
    await this.systemClipboard.writeImage(png);
  }

  /** What collaborators' workspaces reach of the engine. */
  private get actorHost(): ActorWorkspaceHost<O> {
    return this.actorHostFor(this.doc, () => this.selectedIds());
  }

  /** What a workspace over `doc` (this document, or a fork of it) reaches of the engine. */
  private actorHostFor(doc: CanvasDocument, userSelection: () => string[]): ActorWorkspaceHost<O> {
    return {
      product: this.product,
      doc,
      options: () => this.toolOptions,
      viewAspect: () => this.camera.viewport.w / Math.max(this.camera.viewport.h, 1) || 1,
      userSelection,
      exportHost: (scene, selected) => this.exportHostFor(scene, selected, doc),
      copyPng: (host, ids) => this.copyPng(host, ids),
      copySvg: (host, ids) => this.copySvg(host, ids),
      exportCopy: (init) => this.makeExportCopy(init),
    };
  }

  private buildState(): EngineState<O> {
    return {
      tool: this.tool.id,
      mode: this.mode.id,
      options: this.toolOptions,
      zoom: this.camera.zoom,
      selectionCount: this.scene.selection.size,
      selectedIds: this.scene.selection.list(),
      selectedId: this.scene.selection.single() ?? null,
      selectionTypes: this.selectionTypes(),
      selectedPart: this.scene.selection.part,
      textSelection: this.textSelection,
      snapping: this.snapping,
      guidesShown: this.guidesShown,
      rulersShown: this.rulersShown,
      scope: this.scene.scope,
      canUndo: this.activeHistory.canUndo(),
      canRedo: this.activeHistory.canRedo(),
      historyOwner: this.historyTarget?.owner ?? null,
      undoLabel: this.activeHistory.undoLabel(),
      redoLabel: this.activeHistory.redoLabel(),
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
