import { Camera } from "./camera";
import { createCommands } from "./commands";
import type { CommandHandler, CommandId } from "./commands.types";
import { DbSchema } from "./db";
import { findInteraction } from "./find-interaction";
import { hitTestShape } from "./hit-test";
import {
  BoardDocument,
  isConnectable,
  isDbTable,
  isEditableShape,
  type DocumentChange,
  type Shape,
} from "./document";
import { DEFAULT_TOOL_OPTIONS } from "./engine-state";
import type { EngineState } from "./engine-state.types";
import type { Point } from "./geometry.types";
import { bindKeyboard, bindWheel, EdgeAutoPan, PointerInput } from "./input";
import { Renderer, type CanvasTheme } from "./render";
import { removeShapes } from "./remove-shapes";
import { Scene } from "./scene";
import { loadFonts, TextEditor } from "./text";
import {
  createTools,
  type CanvasPointer,
  type Tool,
  type ToolContext,
  type ToolId,
  type ToolOptions,
} from "./tools";
import { optionsFromShape, stylePatches } from "./tools/style-options";
import { debounce, Disposables, FrameScheduler, Store } from "./utils";
import type { CanvasEngineOptions, HostActions } from "./canvas-engine.types";

const ZOOM_STEP = 1.25;
const HIT_TOLERANCE_PX = 4;
/** Text is re-rasterized for the new zoom once zooming settles. */
const TEXT_ZOOM_DELAY_MS = 150;

/**
 * Framework-agnostic infinite canvas for boards. Wires the document, camera, renderer, tools and
 * input together. Hosts call `mount(container)` and drive it through the public methods; UI state
 * is exposed via `subscribe()` / `getState()`.
 */
export class CanvasEngine {
  readonly doc: BoardDocument;
  /** The board's database schema (all `db-table` shapes), for tools and the host's table editor. */
  readonly db: DbSchema;
  readonly commands: Record<CommandId, CommandHandler>;
  private readonly ownsDocument: boolean;
  private readonly camera = new Camera();
  private readonly renderer: Renderer;
  private readonly scene: Scene;
  private readonly tools: Record<ToolId, Tool>;
  private readonly store: Store<EngineState>;
  private readonly disposables = new Disposables();
  private readonly frames = new FrameScheduler(() => this.draw());
  private readonly autoPan = new EdgeAutoPan(this.camera, (dx, dy) => {
    this.camera.panBy(dx, dy);
    this.onCameraChange();
  });
  private readonly updateTextZoom = debounce(() => {
    this.renderer.shapes.setTextZoom(this.camera.zoom);
    this.requestRender();
  }, TEXT_ZOOM_DELAY_MS);

  private hostActions: HostActions = {};
  private tool: Tool;
  private options: ToolOptions = DEFAULT_TOOL_OPTIONS;
  private container: HTMLElement | null = null;
  private textEditor: TextEditor | null = null;
  private mounted = false;
  private destroyed = false;
  private rendererReady = false;

  constructor({ theme, document }: CanvasEngineOptions) {
    this.doc = document ?? new BoardDocument();
    this.ownsDocument = !document;
    this.db = new DbSchema(this.doc);
    this.renderer = new Renderer(theme);
    this.scene = new Scene(this.doc);
    this.tools = createTools(this.createToolContext());
    this.tool = this.tools.select;
    this.commands = createCommands(this);
    this.store = new Store(this.buildState());
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  async mount(container: HTMLElement): Promise<void> {
    if (this.mounted || this.destroyed) return;
    this.mounted = true;
    this.container = container;
    const { width, height } = container.getBoundingClientRect();

    await Promise.all([this.renderer.init(width, height), loadFonts()]);
    if (this.destroyed) {
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
    this.camera.reset();
    this.scene.refresh();
    this.renderer.syncShapes(this.scene.shapes);
    this.renderer.shapes.setTextZoom(this.camera.zoom);

    this.bindInput(container, canvas);
    this.frames.start();
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.frames.stop();
    this.autoPan.stop();
    this.updateTextZoom.cancel();
    this.disposables.dispose();
    this.textEditor?.destroy();
    this.db.destroy();
    this.store.destroy();
    // If mount() is still awaiting init, it destroys the renderer itself once init resolves.
    if (this.rendererReady) this.renderer.destroy();
    if (this.ownsDocument) this.doc.destroy();
  }

  // ── Public API for hosts ──────────────────────────────────────────────

  subscribe = (listener: () => void) => this.store.subscribe(listener);
  getState = (): EngineState => this.store.get();

  setTheme(theme: CanvasTheme): void {
    this.renderer.setTheme(theme);
    this.requestRender();
  }

  /** Lets the host handle shortcuts like Save that need app-level UI. */
  setHostActions(actions: HostActions): void {
    this.hostActions = actions;
  }

  /** Returns `false` when the host doesn't handle the action, so the key event isn't consumed. */
  runHostAction(action: keyof HostActions): boolean {
    const handler = this.hostActions[action];
    if (!handler) return false;
    this.textEditor?.commit();
    handler();
    return true;
  }

  setTool(id: ToolId): void {
    if (this.tool.id === id) return;
    this.tool.onCancel?.();
    this.tool = this.tools[id];
    this.scene.setHover(null);
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  setToolOptions(patch: Partial<ToolOptions>): void {
    this.options = { ...this.options, ...patch };
    this.restyleSelection(patch);
    this.emitChange();
  }

  undo(): void {
    this.textEditor?.commit();
    this.doc.undo();
  }

  redo(): void {
    this.textEditor?.commit();
    this.doc.redo();
  }

  selectAll(): void {
    this.setSelection(this.scene.shapes.map((shape) => shape.id));
  }

  /** Returns `false` when nothing was selected. */
  deleteSelection(): boolean {
    if (this.scene.selection.size === 0) return false;
    removeShapes(this.doc, this.scene, this.scene.selection.ids);
    this.setSelection([]);
    return true;
  }

  /** Opens the text editor on the selected sticky or text. Returns `false` if there is none. */
  editSelection(): boolean {
    const id = this.scene.selection.single();
    if (!id || !isEditableShape(this.doc.get(id))) return false;
    this.textEditor?.start(id);
    return true;
  }

  /** Clears the selection, or returns to the select tool when nothing is selected. */
  cancel(): void {
    if (this.scene.selection.size > 0) this.setSelection([]);
    else this.setTool("select");
  }

  /** Centers the camera on a shape (e.g. a table far away on the board) and selects it. */
  focusShape(id: string): void {
    const shape = this.doc.get(id);
    if (!shape) return;
    this.camera.centerOn({ x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 });
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

  private createToolContext(): ToolContext {
    return {
      doc: this.doc,
      db: this.db,
      camera: this.camera,
      getOptions: () => this.options,
      getSelection: () => this.scene.selection.ids,
      setSelection: (ids) => this.setSelection(ids),
      setTool: (id) => this.setTool(id),
      shapeAt: (world) => this.shapeAt(world),
      shapesInRect: (rect) => this.scene.shapesInRect(rect),
      editText: (id) => this.textEditor?.start(id),
      editNewText: (shape) => this.textEditor?.startDraft(shape),
      setCursor: (cursor) => this.setCursor(cursor),
      setHover: (id) => this.setHover(id),
      setMarquee: (rect) => {
        this.scene.marquee = rect;
        this.requestRender();
      },
      drawDraftStroke: (points) => {
        const { markerColor, markerSize } = this.options;
        this.renderer.draftStroke.draw(points, markerColor, markerSize);
        this.requestRender();
      },
      getShape: (id) => this.scene.get(id),
      connectableAt: (world, exclude) => this.connectableAt(world, exclude),
      getHover: () => this.scene.hoveredId,
      interactionAt: (world) => findInteraction(this.doc, this.scene, world, this.camera.zoom),
      setDraftRelation: (draft, target) => {
        this.scene.draftRelation = draft;
        this.scene.dropTarget = target;
        this.requestRender();
      },
      autoPan: (screen, onPan) => this.autoPan.update(screen, onPan),
      panBy: (dx, dy) => {
        this.camera.panBy(dx, dy);
        this.onCameraChange();
      },
      requestRender: () => this.requestRender(),
    };
  }

  private createTextEditor(container: HTMLElement): TextEditor {
    return new TextEditor(container, this.doc, this.camera, {
      onStart: (id) => {
        this.renderer.shapes.setHiddenText(id);
        this.requestRender();
      },
      onEnd: () => {
        this.renderer.shapes.setHiddenText(null);
        this.requestRender();
      },
      onCreate: (id) => this.setSelection([id]),
    });
  }

  private bindInput(container: HTMLElement, canvas: HTMLCanvasElement): void {
    const pointer = new PointerInput({
      canvas,
      camera: this.camera,
      activeTool: () => this.tool,
      panTool: () => this.tools.hand,
      setCursor: (cursor) => this.setCursor(cursor),
      setHover: (id) => this.setHover(id),
      onGestureStart: () => {
        // Clicking the canvas ends text editing and moves focus away from inputs.
        this.textEditor?.commit();
        (document.activeElement as HTMLElement | null)?.blur?.();
      },
      onDoubleClick: (p) => this.handleDoubleClick(p),
    });
    pointer.bind(this.disposables);
    bindWheel(this.disposables, canvas, this.camera, () => this.onCameraChange());
    bindKeyboard(this.disposables, {
      pointer,
      isEditingText: () => this.textEditor?.editingId != null,
      runCommand: (command) => this.commands[command](),
    });

    this.disposables.add(this.doc.observe((change) => this.handleDocumentChange(change)));
    this.disposables.add(this.doc.onHistoryChange(() => this.emitChange()));

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      this.camera.setViewport(width, height);
      this.renderer.resize(width, height);
      this.requestRender();
    });
    resizeObserver.observe(container);
    this.disposables.add(() => resizeObserver.disconnect());
  }

  // ── Reactions ─────────────────────────────────────────────────────────

  private handleDocumentChange(change: DocumentChange): void {
    this.scene.refresh();
    // Connectors follow the shapes they're attached to, so they're redrawn with them.
    const ids = new Set(change.updated);
    for (const id of this.scene.connectorsAttachedTo([...change.updated, ...change.removed])) {
      if (!change.removed.has(id)) ids.add(id);
    }
    const changed = [...ids]
      .map((id) => this.scene.get(id))
      .filter((shape): shape is Shape => shape !== undefined);
    this.renderer.syncShapes(changed, change.removed);
    this.scene.selection.remove(change.removed);
    this.textEditor?.reposition();
    this.requestRender();
    this.emitChange();
  }

  private handleDoubleClick(p: CanvasPointer): void {
    if (this.tool.id !== "select") return;
    const hit = this.shapeAt(p.world);
    if (!isEditableShape(hit)) return;
    this.setSelection([hit.id]);
    this.textEditor?.start(hit.id);
  }

  private onCameraChange(): void {
    this.tool.onCameraChange?.();
    this.textEditor?.reposition();
    this.updateTextZoom();
    this.requestRender();
    this.emitChange();
  }

  /** Applies picked options to the selected shapes they're for, as one undo step. */
  private restyleSelection(patch: Partial<ToolOptions>): void {
    const selected = this.scene.shapes.filter((shape) => this.scene.selection.has(shape.id));
    const patches = stylePatches(selected, patch);
    if (patches.size === 0) return;
    this.doc.checkpoint();
    this.doc.updateMany(patches);
  }

  // ── State helpers ─────────────────────────────────────────────────────

  private shapeAt(world: Point): Shape | undefined {
    return this.scene.shapeAt(world, HIT_TOLERANCE_PX / this.camera.zoom);
  }

  private connectableAt(world: Point, exclude?: ReadonlySet<string>) {
    const tolerance = HIT_TOLERANCE_PX / this.camera.zoom;
    const shapes = this.scene.shapes;
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i]!;
      if (!isConnectable(shape) || exclude?.has(shape.id)) continue;
      if (hitTestShape(shape, world, tolerance)) return shape;
    }
    return undefined;
  }

  private setSelection(ids: Iterable<string>): void {
    if (!this.scene.selection.set(ids)) return;
    // Show the selected shape's style in the options panel.
    const first = this.scene.get([...this.scene.selection.ids][0] ?? "");
    if (first) this.options = { ...this.options, ...optionsFromShape(first) };
    this.requestRender();
    this.emitChange();
  }

  private setHover(id: string | null): void {
    if (this.scene.setHover(id)) this.requestRender();
  }

  private setCursor(cursor: string): void {
    if (this.container) this.container.style.cursor = cursor;
  }

  private requestRender(): void {
    this.frames.request();
  }

  private draw(): void {
    this.renderer.render(this.camera, this.scene.overlay(this.camera.zoom), this.scene.relations());
  }

  private buildState(): EngineState {
    return {
      tool: this.tool.id,
      options: this.options,
      zoom: this.camera.zoom,
      selectionCount: this.scene.selection.size,
      selectedTableId: this.selectedTableId(),
      selectionTypes: this.selectionTypes(),
      canUndo: this.doc.canUndo(),
      canRedo: this.doc.canRedo(),
    };
  }

  /** Sorted, comma-separated types of the selected shapes (a primitive, so snapshots compare cheaply). */
  private selectionTypes(): string {
    const types = new Set([...this.scene.selection.ids].map((id) => this.scene.get(id)?.type));
    return [...types].filter(Boolean).sort().join(",");
  }

  private selectedTableId(): string | null {
    const id = this.scene.selection.single();
    return id && isDbTable(this.doc.get(id)) ? id : null;
  }

  /** Publishes a new snapshot; the store only notifies when a field actually changed. */
  private emitChange(): void {
    this.store.set(this.buildState());
  }
}
