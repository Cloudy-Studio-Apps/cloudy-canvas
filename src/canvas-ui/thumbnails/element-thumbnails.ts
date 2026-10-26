import {
  Emitter,
  whenIdle,
  type CanvasElement,
  type CanvasEngine,
  type DocumentChange,
} from "@canvas";

/** Thumbnails' longest side, in pixels. */
const THUMBNAIL_SIDE = 240;
/** Changes in an element wait this long before its thumbnail is drawn again. */
const REDRAW_DELAY_MS = 400;
/** The fields an element moved as a whole changes, which leave its thumbnail as it was. */
const MOVE_FIELDS: ReadonlySet<string> = new Set(["x", "y"]);
/** The workspace thumbnails of other scopes are drawn in, so the user's page never changes. */
const WORKSPACE = "thumbnails";

/**
 * Small pictures of top-level elements (a design's frames, a board's sections), drawn one at a
 * time on whatever scope each is, and drawn again a moment after something inside one changes
 * (`engine.rootOf` says what's inside). Observes the document only while someone subscribes. One
 * per engine (`elementThumbnailsOf`).
 */
export class ElementThumbnails {
  private readonly urls = new Map<string, string>();
  private readonly queue = new Set<string>();
  private readonly emitter = new Emitter();
  private listeners = 0;
  private unobserve: (() => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private drawing = false;

  constructor(private readonly engine: CanvasEngine) {
    engine.onClose("canvas-ui.thumbnails", async () => this.forget());
  }

  subscribe = (listener: () => void): (() => void) => {
    const off = this.emitter.subscribe(listener);
    if (this.listeners++ === 0) {
      this.unobserve = this.engine.doc.observe((change) => this.changed(change));
    }
    return () => {
      off();
      if (--this.listeners > 0) return;
      this.unobserve?.();
      this.unobserve = null;
    };
  };

  /** The element's thumbnail URL, or `null` until it's drawn (`request` asks for it). */
  url = (id: string): string | null => this.urls.get(id) ?? null;

  /** Draws the element's thumbnail soon, unless it has one. */
  request(id: string): void {
    if (this.urls.has(id)) return;
    this.queue.add(id);
    this.schedule();
  }

  /**
   * Elements with something changed inside them get drawn again; removed ones are forgotten. An
   * element only moved, with everything in it (an arrange, a drag), looks the same: it's kept.
   */
  private changed({ updated, removed, fields }: DocumentChange): void {
    for (const id of removed) this.drop(id);
    /** Each thumbnailed element with changes inside, and whether they were all only moves. */
    const touched = new Map<string, boolean>();
    for (const id of updated) {
      const root = this.engine.rootOf(id);
      if (!root || !this.urls.has(root)) continue;
      touched.set(root, (touched.get(root) ?? true) && onlyMoved(fields?.get(id)));
    }
    for (const [root, moved] of touched) {
      // Something moved inside an element that stayed changes the picture.
      if (!moved || !updated.has(root)) this.queue.add(root);
    }
    if (this.queue.size > 0) this.schedule();
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.drawQueued(), REDRAW_DELAY_MS);
  }

  /**
   * Draws the queued elements one after another (each export renders a scope), each when the app
   * is idle, so typing, panels and canvas animations go on between them.
   */
  private async drawQueued(): Promise<void> {
    this.timer = null;
    if (this.drawing) return;
    this.drawing = true;
    try {
      for (let [id] = this.queue; id !== undefined; [id] = this.queue) {
        this.queue.delete(id);
        await whenIdle();
        await this.draw(id);
      }
    } finally {
      this.drawing = false;
    }
  }

  private async draw(id: string): Promise<void> {
    const el = this.engine.doc.get(id);
    if (!el) return this.drop(id);
    try {
      const file = (await this.capture(el)) ?? (await this.render(el));
      const before = this.urls.get(id);
      this.urls.set(id, URL.createObjectURL(file));
      if (before) URL.revokeObjectURL(before);
      this.emitter.emit();
    } catch {
      // The element went (or emptied) while it was being drawn: it has no thumbnail.
      this.drop(id);
    }
  }

  /**
   * The element as the scope on screen shows it, from the views already drawn (about a frame's
   * work, encoded off the UI thread); `null` for elements it can't take that way: on another
   * scope or turned (its picture is the axis-aligned area).
   */
  private capture(el: CanvasElement): Promise<Blob | null> {
    if (this.engine.scopeOf(el) !== this.engine.scope || el.rotation) return Promise.resolve(null);
    const { x, y, w, h } = el;
    return this.engine.captureArea({ x, y, w, h }, { scale: scaleFor(el), unfaded: true });
  }

  /** The element drawn on its own off screen, on whichever scope it is (slower: views are built). */
  private render(el: CanvasElement): Promise<Blob> {
    const workspace = this.engine.workspace(WORKSPACE);
    const scope = this.engine.scopeOf(el);
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
    const { x, y, w, h } = el;
    return workspace.exportElements({
      format: "jpg",
      background: "solid",
      area: "board",
      ids: [el.id],
      rect: { x, y, w, h },
      scale: scaleFor(el),
    });
  }

  private drop(id: string): void {
    const url = this.urls.get(id);
    if (!url) return;
    URL.revokeObjectURL(url);
    this.urls.delete(id);
    this.emitter.emit();
  }

  private forget(): void {
    if (this.timer) clearTimeout(this.timer);
    this.queue.clear();
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
  }
}

/** The scale that makes an element's longest side `THUMBNAIL_SIDE` pixels. */
function scaleFor({ w, h }: CanvasElement): number {
  return THUMBNAIL_SIDE / Math.max(w, h, 1);
}

/** Whether an element's changed fields are only its place. */
function onlyMoved(changed: ReadonlySet<string> | "all" | undefined): boolean {
  if (!changed || changed === "all") return false;
  for (const key of changed) if (!MOVE_FIELDS.has(key)) return false;
  return true;
}

const thumbnails = new WeakMap<CanvasEngine, ElementThumbnails>();

/** The engine's element thumbnails, made on first use. */
export function elementThumbnailsOf(engine: CanvasEngine): ElementThumbnails {
  let found = thumbnails.get(engine);
  if (!found) {
    found = new ElementThumbnails(engine);
    thumbnails.set(engine, found);
  }
  return found;
}
