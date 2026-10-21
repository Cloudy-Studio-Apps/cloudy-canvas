import type { Clipboard } from "@shared/core";

import { Camera } from "./camera";
import { ElementClipboard, MemoryClipboard, PASTE_STEP } from "./clipboard";
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
import type { Point } from "./geometry.types";
import { bindKeyboard, bindWheel, EdgeAutoPan, Keymap, PointerInput } from "./input";
import { Renderer, type CanvasTheme } from "./render";
import { Scene } from "./scene";
import { loadFonts, TextEditor } from "./text";
import { createBaseTools, type CanvasPointer, type Tool, type ToolContext } from "./tools";
import { debounce, Disposables, FrameScheduler, Store } from "./utils";
import type { CanvasEngineOptions, HostActions } from "./canvas-engine.types";
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

  private hostActions: HostActions = {};
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
    this.renderer = new Renderer(theme, this.kinds, this.links);
    this.scene = new Scene(this.doc, this.kinds, product.resolveElements?.bind(product));
    this.clipboard = this.createClipboard(clipboard ?? new MemoryClipboard());
    const ctx = this.createToolContext();
    const tools = [...createBaseTools(ctx), ...product.createTools(ctx)];
    this.tools = new Map(tools.map((tool) => [tool.id, tool]));
    this.tool = tools[0]!;
    this.commands = createCommands(this, [...this.tools.keys()]);
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

  /** Switches to a tool by id. Unknown ids are ignored. */
  setTool(id: string): void {
    const next = this.tools.get(id);
    if (!next || this.tool === next) return;
    this.tool.onCancel?.();
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

  /** Returns `false` when nothing was selected. */
  deleteSelection(): boolean {
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

  /** Pastes the clipboard's elements (or its text) and selects them. */
  paste(): void {
    this.textEditor?.commit();
    void this.clipboard.paste();
  }

  /** Adds a copy of the selection next to it and selects the copy. Returns `false` when nothing was selected. */
  duplicateSelection(): boolean {
    const selected = [...this.scene.selection.ids];
    if (selected.length === 0) return false;
    const ids = this.clipboard.duplicate(selected, { x: PASTE_STEP, y: PASTE_STEP });
    this.setSelection(selected.map((id) => ids.get(id)).filter((id) => id !== undefined));
    return true;
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

  /** Opens the text editor on the selected element. Returns `false` if it has no text. */
  editSelection(): boolean {
    const id = this.scene.selection.single();
    const el = id ? this.doc.get(id) : undefined;
    if (!el || !this.kinds.kindOf(el).text) return false;
    this.textEditor?.start(el.id);
    return true;
  }

  /** Clears the selection, or returns to the select tool when nothing is selected. */
  cancel(): void {
    if (this.scene.selection.size > 0) this.setSelection([]);
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
      editText: (id) => this.textEditor?.start(id),
      editNewText: (el) => this.textEditor?.startDraft(el),
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
      requestRender: () => this.requestRender(),
    };
  }

  private createClipboard(clipboard: Clipboard): ElementClipboard<O> {
    return new ElementClipboard(
      {
        product: this.product,
        doc: this.doc,
        elements: () => this.scene.elements,
        getElement: (id) => this.scene.get(id),
        withMembers: (ids) => this.withMembers(ids, "move"),
        visibleRect: () => this.camera.visibleWorldRect(),
        getOptions: () => this.options,
        select: (ids) => this.setSelection(ids),
      },
      clipboard,
    );
  }

  private createTextEditor(container: HTMLElement): TextEditor {
    return new TextEditor(container, this.doc, this.kinds, this.camera, {
      getElement: (id) => this.scene.get(id),
      onStart: (id) => {
        this.renderer.setHiddenText(id);
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
  }

  private handleDoubleClick(p: CanvasPointer): void {
    if (this.tool.id !== "select") return;
    const hit = this.elementAt(p.world);
    if (!hit || !this.kinds.kindOf(hit).text) return;
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

  // ── State helpers ─────────────────────────────────────────────────────

  /** The ids plus what the product says goes with them when moved or deleted. */
  private withMembers(ids: Iterable<string>, purpose: "move" | "delete"): Set<string> {
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
    this.renderer.render(
      this.camera,
      this.scene.overlay(this.camera.zoom),
      this.scene.selection.ids,
    );
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
