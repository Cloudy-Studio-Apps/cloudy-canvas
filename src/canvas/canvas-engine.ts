import type { Clipboard, DroppedFile } from "@shared/core";

import { Camera } from "./camera";
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
  elementInfo,
  type CanvasElement,
  type ElementInfo,
  type ElementKinds,
  type ElementPatch,
} from "./elements";
import { findInteraction } from "./find-interaction";
import type { EngineState } from "./engine-state.types";
import type { Point, Rect } from "./geometry.types";
import { bindKeyboard, bindWheel, EdgeAutoPan, Keymap, PointerInput } from "./input";
import { Renderer, type CanvasTheme } from "./render";
import { Scene } from "./scene";
import { loadFonts, TextEditor } from "./text";
import { createBaseTools, type CanvasPointer, type Tool, type ToolContext } from "./tools";
import { debounce, Disposables, Emitter, FrameScheduler, Store } from "./utils";
import type { CanvasEngineOptions, ElementAction, HostAction } from "./canvas-engine.types";
import type { CanvasProduct } from "./canvas-product.types";
import type { CanvasLinks } from "./links";

const ZOOM_STEP = 1.25;
const HIT_TOLERANCE_PX = 4;
/** Text is re-rasterized for the new zoom once zooming settles. */
const TEXT_ZOOM_DELAY_MS = 150;

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
  private readonly ownsDocument: boolean;
  private readonly product: CanvasProduct<O>;
  private readonly links: CanvasLinks[];
  private readonly camera = new Camera();
  private readonly renderer: Renderer;
  private readonly scene: Scene;
  private readonly clipboard: ElementClipboard<O>;
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
  private readonly hostActions = new Map<string, HostAction>();
  private tool: Tool;
  private options: O;
  private container: HTMLElement | null = null;
  private textEditor: TextEditor | null = null;
  private mounted = false;
  private destroyed = false;
  private rendererReady = false;

  constructor({ product, theme, document, clipboard }: CanvasEngineOptions<O>) {
    this.product = product;
    this.kinds = product.kinds;
    this.keymap = new Keymap(product.keybindings);
    this.options = product.defaultOptions;
    this.doc = document ?? new CanvasDocument(this.kinds);
    this.ownsDocument = !document;
    this.links = product.createLinks?.() ?? [];
    this.renderer = new Renderer(theme, this.kinds, this.links, {
      read: (id) => this.doc.getAsset(id),
      onLoad: () => this.requestRender(),
    });
    this.scene = new Scene(this.doc, this.kinds, product.resolveElements?.bind(product));
    this.clipboard = this.createClipboard(clipboard ?? new MemoryClipboard());
    const ctx = this.createToolContext();
    const tools = [...createBaseTools(ctx), ...product.createTools(ctx)];
    this.tools = new Map(tools.map((tool) => [tool.id, tool]));
    this.tool = tools[0]!;
    this.commands = createCommands(this, [...this.tools.keys()], product.hostCommands ?? []);
    this.store = new Store(this.buildState());
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  async mount(container: HTMLElement): Promise<void> {
    if (this.mounted || this.destroyed) return;
    this.mounted = true;
    this.container = container;
    const { width, height } = container.getBoundingClientRect();

    await Promise.all([this.renderer.init(width, height), loadFonts(this.kinds)]);
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
    this.refreshScene();
    this.renderer.syncElements(this.scene.elements);
    this.renderer.setTextZoom(this.camera.zoom);

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
    this.store.destroy();
    this.viewChanges.clear();
    this.elementActions.clear();
    // If mount() is still awaiting init, it destroys the renderer itself once init resolves.
    if (this.rendererReady) this.renderer.destroy();
    if (this.ownsDocument) this.doc.destroy();
  }

  // ── Public API for hosts ──────────────────────────────────────────────

  subscribe = (listener: () => void) => this.store.subscribe(listener);
  getState = (): EngineState<O> => this.store.get();

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
    this.tool = next;
    this.scene.setHover(null);
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  setToolOptions(patch: Partial<O>): void {
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
    this.setSelection(this.scene.elements.map((el) => el.id));
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
    const removing = [...this.withMembers(ids, "delete")].filter((id) => this.doc.get(id));
    if (removing.length === 0) return [];
    const before = this.scene.elements;
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.remove(removing);
      this.product.onRemove?.(this.doc, new Set(removing), before);
    });
    return removing;
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
    const el = id ? this.doc.get(id) : undefined;
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
    const { x, y, w, h } = this.kinds.kindOf(el).bounds(el);
    this.camera.centerOn({ x: x + w / 2, y: y + h / 2 });
    this.setSelection([id]);
    this.onCameraChange();
  }

  /** Fits an element in the view and selects it. */
  zoomToElement(id: string): void {
    const el = this.scene.get(id);
    if (!el) return;
    this.camera.fitRect(this.kinds.kindOf(el).bounds(el));
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
      getOptions: () => this.options,
      getSelection: () => this.scene.selection.ids,
      setSelection: (ids) => this.setSelection(ids),
      setTool: (id) => this.setTool(id),
      elementAt: (world) => this.elementAt(world),
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
      duplicate: (ids) => this.clipboard.duplicate(ids, { x: 0, y: 0 }),
      getHover: () => this.scene.hoveredId,
      interactionAt: (world) => findInteraction(this.scene, world, this.camera.zoom),
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
    this.refreshScene();
    // Derived geometry may follow any change, so those elements are redrawn every time.
    const changed = [...new Set([...change.updated, ...this.scene.derivedIds])]
      .map((id) => this.scene.get(id))
      .filter((el): el is CanvasElement => el !== undefined);
    this.renderer.syncElements(changed, change.removed);
    this.scene.selection.remove(change.removed);
    this.textEditor?.reposition();
    this.requestRender();
    this.emitChange();
    this.viewChanges.emit();
  }

  private handleDoubleClick(p: CanvasPointer): void {
    if (this.tool.id !== "select") return;
    const hit = this.elementAt(p.world);
    const text = hit ? this.kinds.kindOf(hit).text : null;
    if (!hit || !text) return;
    this.setSelection([hit.id]);
    this.textEditor?.start(hit.id, text.partAt?.(hit, p.world));
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

  /** Re-reads the elements, and re-resolves the links between them. */
  private refreshScene(): void {
    this.scene.refresh();
    for (const links of this.links) links.update(this.scene.elements);
  }

  private elementAt(world: Point): CanvasElement | undefined {
    return this.scene.elementAt(world, HIT_TOLERANCE_PX / this.camera.zoom);
  }

  private setSelection(ids: Iterable<string>): void {
    if (!this.scene.selection.set(ids)) return;
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

  private requestRender(): void {
    this.frames.request();
  }

  private draw(): void {
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
