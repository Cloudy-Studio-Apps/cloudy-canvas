import { Camera } from "./camera";
import { BoardDocument, MARKER_COLORS, MARKER_SIZES, STICKY_COLORS, type Shape } from "./document";
import { Emitter } from "./events";
import { rectsIntersect, unionRects, type Point, type Rect } from "./geometry";
import { shapeBounds, topmostShapeAt } from "./hit-test";
import { Renderer, type CanvasTheme, type OverlayState } from "./render/renderer";
import { TextEditor } from "./text/text-editor";
import { HandTool } from "./tools/hand-tool";
import { MarkerTool } from "./tools/marker-tool";
import { SelectTool } from "./tools/select-tool";
import { StickyTool } from "./tools/sticky-tool";
import { TextTool } from "./tools/text-tool";
import type { CanvasPointer, Tool, ToolContext, ToolId, ToolOptions } from "./tools/types";

/** Snapshot for UI hosts (immutable; replaced on every change). */
export interface EngineState {
  tool: ToolId;
  options: ToolOptions;
  zoom: number;
  selectionCount: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface CanvasEngineOptions {
  theme: CanvasTheme;
  /** Existing document to edit; a new empty one is created otherwise. */
  document?: BoardDocument;
}

const ZOOM_STEP = 1.25;
const HIT_TOLERANCE_PX = 4;

const TOOL_SHORTCUTS: Record<string, ToolId> = {
  v: "select",
  h: "hand",
  m: "marker",
  s: "sticky",
  t: "text",
};

/**
 * Framework-agnostic infinite canvas for boards. Hosts call `mount(container)` and drive it through
 * the public methods; UI state is exposed via `subscribe()` / `getState()`.
 */
export class CanvasEngine {
  readonly doc: BoardDocument;
  private readonly camera = new Camera();
  private readonly renderer: Renderer;
  private readonly emitter = new Emitter();
  private readonly tools: Record<ToolId, Tool>;
  private tool: Tool;
  private options: ToolOptions = {
    markerColor: MARKER_COLORS[0].value,
    markerSize: MARKER_SIZES[1].value,
    stickyColor: STICKY_COLORS[0].value,
  };
  private selection = new Set<string>();
  private hoverId: string | null = null;
  private marquee: Rect | null = null;
  private shapes: Shape[] = [];
  private state: EngineState;

  private container: HTMLElement | null = null;
  private textEditor: TextEditor | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private cleanups: (() => void)[] = [];
  private frame = 0;
  private textZoomTimer = 0;
  private destroyed = false;
  private mounted = false;
  private rendererReady = false;
  private readonly ownsDocument: boolean;

  /** Gesture overrides: a held Space or middle mouse button pans temporarily. */
  private spaceHeld = false;
  private activePointer: { id: number; tool: Tool } | null = null;

  constructor({ theme, document }: CanvasEngineOptions) {
    this.doc = document ?? new BoardDocument();
    this.ownsDocument = !document;
    this.renderer = new Renderer(theme);
    const ctx = this.createToolContext();
    this.tools = {
      select: new SelectTool(ctx),
      hand: new HandTool(ctx),
      marker: new MarkerTool(ctx),
      sticky: new StickyTool(ctx),
      text: new TextTool(ctx),
    };
    this.tool = this.tools.select;
    this.state = this.buildState();
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

    const canvas = this.renderer.canvas;
    canvas.style.display = "block";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);

    this.textEditor = new TextEditor(container, this.doc, this.camera, {
      onStart: (id) => {
        this.renderer.setHiddenText(id);
        this.requestRender();
      },
      onEnd: () => {
        this.renderer.setHiddenText(null);
        this.requestRender();
      },
      onCreate: (id) => this.setSelection([id]),
    });

    this.camera.centerOn({ x: 0, y: 0 }, { w: width, h: height });
    this.shapes = this.doc.all();
    this.renderer.syncShapes(this.shapes);
    this.renderer.setTextZoom(this.camera.zoom);

    this.bindEvents(container, canvas);
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    window.clearTimeout(this.textZoomTimer);
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups = [];
    this.resizeObserver?.disconnect();
    this.textEditor?.destroy();
    this.emitter.clear();
    // If mount() is still awaiting init, it destroys the renderer itself once init resolves.
    if (this.rendererReady) this.renderer.destroy();
    if (this.ownsDocument) this.doc.destroy();
  }

  // ── Public API for hosts ──────────────────────────────────────────────

  subscribe = (listener: () => void) => this.emitter.subscribe(listener);
  getState = (): EngineState => this.state;

  setTool(id: ToolId): void {
    if (this.tool.id === id) return;
    this.tool.onCancel?.();
    this.tool = this.tools[id];
    this.hoverId = null;
    this.setCursor(this.tool.cursor);
    this.requestRender();
    this.emitChange();
  }

  setToolOptions(patch: Partial<ToolOptions>): void {
    this.options = { ...this.options, ...patch };
    // Recolor selected sticky notes when picking a sticky color, like FigJam.
    if (patch.stickyColor) {
      const stickies = [...this.selection].filter((id) => this.doc.get(id)?.type === "sticky");
      if (stickies.length > 0) {
        this.doc.checkpoint();
        this.doc.updateMany(new Map(stickies.map((id) => [id, { color: patch.stickyColor }])));
      }
    }
    this.emitChange();
  }

  undo(): void {
    this.textEditor?.commit();
    this.doc.undoManager.undo();
  }

  redo(): void {
    this.textEditor?.commit();
    this.doc.undoManager.redo();
  }

  deleteSelection(): void {
    if (this.selection.size === 0) return;
    this.doc.checkpoint();
    this.doc.remove(this.selection);
    this.setSelection([]);
  }

  selectAll(): void {
    this.setSelection(this.shapes.map((shape) => shape.id));
  }

  zoomIn(): void {
    this.zoomAtCenter(this.camera.zoom * ZOOM_STEP);
  }

  zoomOut(): void {
    this.zoomAtCenter(this.camera.zoom / ZOOM_STEP);
  }

  zoomTo(zoom: number): void {
    this.zoomAtCenter(zoom);
  }

  zoomToFit(): void {
    const bounds = unionRects(this.shapes.map(shapeBounds));
    const viewport = this.viewport();
    if (bounds) {
      this.camera.fitRect(bounds, viewport);
    } else {
      this.camera.zoom = 1;
      this.camera.centerOn({ x: 0, y: 0 }, viewport);
    }
    this.onCameraChange();
  }

  // ── Internals ─────────────────────────────────────────────────────────

  private createToolContext(): ToolContext {
    return {
      doc: this.doc,
      camera: this.camera,
      getOptions: () => this.options,
      getSelection: () => this.selection,
      setSelection: (ids) => this.setSelection(ids),
      setTool: (id) => this.setTool(id),
      shapeAt: (world) => this.shapeAt(world),
      shapesInRect: (rect) =>
        this.shapes.filter((shape) => rectsIntersect(shapeBounds(shape), rect)),
      editText: (id) => this.textEditor?.start(id),
      editNewText: (shape) => this.textEditor?.startDraft(shape),
      setCursor: (cursor) => this.setCursor(cursor),
      setHover: (id) => this.setHover(id),
      setMarquee: (rect) => {
        this.marquee = rect;
        this.requestRender();
      },
      drawDraftStroke: (points) => {
        this.renderer.drawDraftStroke(points, this.options.markerColor, this.options.markerSize);
        this.requestRender();
      },
      panBy: (dx, dy) => {
        this.camera.panBy(dx, dy);
        this.onCameraChange();
      },
      requestRender: () => this.requestRender(),
    };
  }

  private setHover(id: string | null): void {
    if (this.hoverId === id) return;
    this.hoverId = id;
    this.requestRender();
  }

  private shapeAt(world: Point): Shape | undefined {
    return topmostShapeAt(this.shapes, world, HIT_TOLERANCE_PX / this.camera.zoom);
  }

  private setSelection(ids: Iterable<string>): void {
    const next = new Set(ids);
    if (next.size === this.selection.size && [...next].every((id) => this.selection.has(id)))
      return;
    this.selection = next;
    this.requestRender();
    this.emitChange();
  }

  private setCursor(cursor: string): void {
    if (this.container) this.container.style.cursor = cursor;
  }

  private viewport() {
    const screen = this.renderer.app.screen;
    return { w: screen.width, h: screen.height };
  }

  private zoomAtCenter(zoom: number): void {
    const { w, h } = this.viewport();
    this.camera.zoomAt({ x: w / 2, y: h / 2 }, zoom);
    this.onCameraChange();
  }

  private onCameraChange(): void {
    this.textEditor?.reposition();
    this.requestRender();
    window.clearTimeout(this.textZoomTimer);
    this.textZoomTimer = window.setTimeout(() => {
      this.renderer.setTextZoom(this.camera.zoom);
      this.requestRender();
    }, 150);
    this.emitChange();
  }

  private requestRender(): void {
    if (this.frame || !this.mounted || this.destroyed) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (this.destroyed) return;
      this.renderer.render(this.camera, this.overlayState());
    });
  }

  private overlayState(): OverlayState {
    const selected = this.shapes.filter((shape) => this.selection.has(shape.id)).map(shapeBounds);
    const hover = this.hoverId ? this.doc.get(this.hoverId) : undefined;
    return {
      selection: selected,
      selectionBounds: selected.length > 1 ? unionRects(selected) : null,
      hover: hover ? shapeBounds(hover) : null,
      marquee: this.marquee,
    };
  }

  private buildState(): EngineState {
    return {
      tool: this.tool.id,
      options: this.options,
      zoom: this.camera.zoom,
      selectionCount: this.selection.size,
      canUndo: this.doc.undoManager.canUndo(),
      canRedo: this.doc.undoManager.canRedo(),
    };
  }

  /** Publishes a new snapshot only when something the UI shows actually changed. */
  private emitChange(): void {
    const next = this.buildState();
    const prev = this.state;
    if (
      prev.tool === next.tool &&
      prev.options === next.options &&
      prev.zoom === next.zoom &&
      prev.selectionCount === next.selectionCount &&
      prev.canUndo === next.canUndo &&
      prev.canRedo === next.canRedo
    ) {
      return;
    }
    this.state = next;
    this.emitter.emit();
  }

  // ── Events ────────────────────────────────────────────────────────────

  private bindEvents(container: HTMLElement, canvas: HTMLCanvasElement): void {
    const listen = <K extends keyof HTMLElementEventMap>(
      target: HTMLElement | Window,
      type: K,
      handler: (event: HTMLElementEventMap[K]) => void,
      options?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, handler as EventListener, options);
      this.cleanups.push(() => target.removeEventListener(type, handler as EventListener, options));
    };

    listen(canvas, "pointerdown", this.handlePointerDown);
    listen(canvas, "pointermove", this.handlePointerMove);
    listen(canvas, "pointerup", this.handlePointerUp);
    listen(canvas, "pointercancel", this.handlePointerCancel);
    listen(canvas, "pointerleave", () => this.setHover(null));
    listen(canvas, "dblclick", this.handleDoubleClick);
    listen(canvas, "wheel", this.handleWheel, { passive: false });
    listen(canvas, "contextmenu", (event) => event.preventDefault());
    listen(window, "keydown", this.handleKeyDown);
    listen(window, "keyup", this.handleKeyUp);
    listen(window, "blur", () => this.releaseSpace());

    const unobserve = this.doc.observe((change) => {
      this.shapes = this.doc.all();
      const changed = [...change.updated]
        .map((id) => this.doc.get(id))
        .filter((shape): shape is Shape => shape !== undefined);
      this.renderer.syncShapes(changed, change.removed);
      if ([...change.removed].some((id) => this.selection.has(id))) {
        this.setSelection([...this.selection].filter((id) => !change.removed.has(id)));
      }
      this.textEditor?.reposition();
      this.requestRender();
      this.emitChange();
    });
    this.cleanups.push(unobserve);

    // The undo stack updates after document observers run, so track it separately.
    const undoManager = this.doc.undoManager;
    const onStackChange = () => this.emitChange();
    for (const event of ["stack-item-added", "stack-item-popped", "stack-cleared"] as const) {
      undoManager.on(event, onStackChange);
      this.cleanups.push(() => undoManager.off(event, onStackChange));
    }

    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      this.renderer.resize(width, height);
      this.requestRender();
    });
    this.resizeObserver.observe(container);
  }

  private toPointer(event: PointerEvent | MouseEvent): CanvasPointer {
    const rect = this.renderer.canvas.getBoundingClientRect();
    const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    return {
      screen,
      world: this.camera.screenToWorld(screen),
      shiftKey: event.shiftKey,
      modKey: event.ctrlKey || event.metaKey,
      altKey: event.altKey,
    };
  }

  private handlePointerDown = (event: PointerEvent) => {
    if (this.activePointer) return;
    const isPan = event.button === 1 || (event.button === 0 && this.spaceHeld);
    if (event.button !== 0 && !isPan) return;
    event.preventDefault();
    // Clicking the canvas ends text editing (blur) and returns focus away from inputs.
    this.textEditor?.commit();
    (document.activeElement as HTMLElement | null)?.blur?.();

    const tool = isPan ? this.tools.hand : this.tool;
    this.activePointer = { id: event.pointerId, tool };
    this.renderer.canvas.setPointerCapture(event.pointerId);
    tool.onPointerDown(this.toPointer(event));
  };

  private handlePointerMove = (event: PointerEvent) => {
    const pointer = this.toPointer(event);
    if (this.activePointer?.id === event.pointerId) {
      this.activePointer.tool.onPointerMove(pointer);
    } else if (!this.activePointer && !this.spaceHeld) {
      this.tool.onHover?.(pointer);
    }
  };

  private handlePointerUp = (event: PointerEvent) => {
    if (this.activePointer?.id !== event.pointerId) return;
    const { tool } = this.activePointer;
    this.activePointer = null;
    tool.onPointerUp(this.toPointer(event));
    this.setCursor(this.spaceHeld ? "grab" : this.tool.cursor);
  };

  private handlePointerCancel = (event: PointerEvent) => {
    if (this.activePointer?.id !== event.pointerId) return;
    this.activePointer.tool.onCancel?.();
    this.activePointer = null;
    this.setCursor(this.tool.cursor);
  };

  private handleDoubleClick = (event: MouseEvent) => {
    if (this.tool.id !== "select") return;
    const hit = this.shapeAt(this.toPointer(event).world);
    if (hit && (hit.type === "sticky" || hit.type === "text")) {
      this.setSelection([hit.id]);
      this.textEditor?.start(hit.id);
    }
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
    const dx = event.deltaX * scale;
    const dy = event.deltaY * scale;
    if (event.ctrlKey || event.metaKey) {
      // Pinch-to-zoom arrives as ctrl+wheel too. Clamp so a mouse wheel notch is a gentle step.
      const factor = Math.exp(-Math.max(-30, Math.min(30, dy)) * 0.01);
      this.camera.zoomAt(this.toPointer(event).screen, this.camera.zoom * factor);
    } else if (event.shiftKey && dx === 0) {
      this.camera.panBy(-dy, 0);
    } else {
      this.camera.panBy(-dx, -dy);
    }
    this.onCameraChange();
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || isTypingTarget(event.target) || this.textEditor?.editingId)
      return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (event.key === " ") {
      if (isInteractiveTarget(event.target)) return;
      event.preventDefault();
      if (!this.spaceHeld && !this.activePointer) {
        this.spaceHeld = true;
        this.setHover(null);
        this.setCursor("grab");
      }
      return;
    }

    if (mod && key === "z") {
      event.preventDefault();
      if (event.shiftKey) this.redo();
      else this.undo();
    } else if (mod && key === "y") {
      event.preventDefault();
      this.redo();
    } else if (mod && key === "a") {
      event.preventDefault();
      this.selectAll();
    } else if (mod && key === "0") {
      event.preventDefault();
      this.zoomTo(1);
    } else if (mod && (key === "=" || key === "+")) {
      event.preventDefault();
      this.zoomIn();
    } else if (mod && key === "-") {
      event.preventDefault();
      this.zoomOut();
    } else if (event.shiftKey && event.code === "Digit1") {
      event.preventDefault();
      this.zoomToFit();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      if (this.selection.size === 0) return;
      event.preventDefault();
      this.deleteSelection();
    } else if (event.key === "Escape") {
      if (this.selection.size > 0) this.setSelection([]);
      else this.setTool("select");
    } else if (event.key === "Enter" && this.selection.size === 1) {
      const [id] = this.selection;
      const shape = id ? this.doc.get(id) : undefined;
      if (shape && shape.type !== "stroke") {
        event.preventDefault();
        this.textEditor?.start(shape.id);
      }
    } else if (!mod && !event.altKey && TOOL_SHORTCUTS[key]) {
      this.setTool(TOOL_SHORTCUTS[key]);
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === " ") this.releaseSpace();
  };

  private releaseSpace(): void {
    if (!this.spaceHeld) return;
    this.spaceHeld = false;
    if (!this.activePointer) this.setCursor(this.tool.cursor);
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("button, a, [role='menuitem']") !== null;
}

async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('400 16px "Inter Variable"'),
      document.fonts.load('400 20px "Inter Variable"'),
    ]);
  } catch {
    // Fall back to system fonts.
  }
}
