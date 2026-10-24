import { Emitter, whenIdle, type DocumentChange } from "@canvas";
import { drawFrame, isPageFrame, type DesignEngine, type FrameElement } from "@design";

/** Thumbnails' longest side, in pixels. */
const THUMBNAIL_SIDE = 240;
/** Changes in a frame wait this long before its thumbnail is drawn again. */
const REDRAW_DELAY_MS = 400;
/** How deep a layer tree is followed up to its top-level frame. */
const MAX_DEPTH = 256;
/** The fields a frame moved as a whole changes, which leave its thumbnail as it was. */
const MOVE_FIELDS: ReadonlySet<string> = new Set(["x", "y"]);
/** The workspace thumbnails are drawn in, so the user's page never changes. */
const WORKSPACE = "catalog:thumbnails";

/**
 * Small pictures of page frames, drawn one at a time, on whatever design page each frame is, and
 * drawn again a moment after something inside a frame changes. Observes the document only while
 * someone subscribes. One per engine (`frameThumbnailsOf`).
 */
export class FrameThumbnails {
  private readonly urls = new Map<string, string>();
  private readonly queue = new Set<string>();
  private readonly emitter = new Emitter();
  private listeners = 0;
  private unobserve: (() => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private drawing = false;

  constructor(private readonly engine: DesignEngine) {
    engine.onClose("catalog.thumbnails", async () => this.forget());
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

  /** The frame's thumbnail URL, or `null` until it's drawn (`request` asks for it). */
  url = (frameId: string): string | null => this.urls.get(frameId) ?? null;

  /** Draws the frame's thumbnail soon, unless it has one. */
  request(frameId: string): void {
    if (this.urls.has(frameId)) return;
    this.queue.add(frameId);
    this.schedule();
  }

  /**
   * Frames with something changed inside them get drawn again; removed ones are forgotten. A
   * frame only moved, with everything in it (an arrange, a drag), looks the same: it's kept.
   */
  private changed({ updated, removed, fields }: DocumentChange): void {
    for (const id of removed) this.drop(id);
    /** Each thumbnailed frame with changes inside, and whether they were all only moves. */
    const touched = new Map<string, boolean>();
    for (const id of updated) {
      const frame = this.topOf(id);
      if (!frame || !this.urls.has(frame)) continue;
      touched.set(frame, (touched.get(frame) ?? true) && onlyMoved(fields?.get(id)));
    }
    for (const [frame, moved] of touched) {
      // A child moved inside a frame that stayed changes the picture.
      if (!moved || !updated.has(frame)) this.queue.add(frame);
    }
    if (this.queue.size > 0) this.schedule();
  }

  /** The top-level node holding `id` (itself at the top), read without whole elements. */
  private topOf(id: string): string | null {
    let current = id;
    // Bounded, so a broken parent chain can't loop forever.
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
      const parent = this.engine.doc.field(current, "parentId");
      if (parent === null) return current;
      // Not a node, or gone.
      if (typeof parent !== "string") return null;
      current = parent;
    }
    return null;
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.drawQueued(), REDRAW_DELAY_MS);
  }

  /**
   * Draws the queued frames one after another (each export renders a page), each when the app is
   * idle, so typing, panels and canvas animations go on between them.
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

  private async draw(frameId: string): Promise<void> {
    const frame = this.engine.doc.get(frameId);
    if (!isPageFrame(frame)) return this.drop(frameId);
    try {
      const file = (await this.capture(frame)) ?? (await this.render(frame));
      const before = this.urls.get(frameId);
      this.urls.set(frameId, URL.createObjectURL(file));
      if (before) URL.revokeObjectURL(before);
      this.emitter.emit();
    } catch {
      // The frame went (or emptied) while it was being drawn: it has no thumbnail.
      this.drop(frameId);
    }
  }

  /**
   * The frame as the page on screen shows it, from the views already drawn (about a frame's work,
   * encoded off the UI thread); `null` for frames it can't take that way: on another page or
   * turned (its picture is the axis-aligned area).
   */
  private capture(frame: FrameElement): Promise<Blob | null> {
    if (frame.pageId !== this.engine.scope || frame.rotation) return Promise.resolve(null);
    const { x, y, w, h } = frame;
    const scale = THUMBNAIL_SIDE / Math.max(w, h, 1);
    return this.engine.captureArea({ x, y, w, h }, { scale, unfaded: true });
  }

  /** The frame drawn on its own off screen, on whichever page it is (slower: views are built). */
  private render(frame: FrameElement): Promise<Blob> {
    return drawFrame(this.engine.workspace(WORKSPACE), frame, { maxSide: THUMBNAIL_SIDE });
  }

  private drop(frameId: string): void {
    const url = this.urls.get(frameId);
    if (!url) return;
    URL.revokeObjectURL(url);
    this.urls.delete(frameId);
    this.emitter.emit();
  }

  private forget(): void {
    if (this.timer) clearTimeout(this.timer);
    this.queue.clear();
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
  }
}

/** Whether an element's changed fields are only its place. */
function onlyMoved(changed: ReadonlySet<string> | "all" | undefined): boolean {
  if (!changed || changed === "all") return false;
  for (const key of changed) if (!MOVE_FIELDS.has(key)) return false;
  return true;
}

const thumbnails = new WeakMap<DesignEngine, FrameThumbnails>();

/** The engine's frame thumbnails, made on first use. */
export function frameThumbnailsOf(engine: DesignEngine): FrameThumbnails {
  let found = thumbnails.get(engine);
  if (!found) {
    found = new FrameThumbnails(engine);
    thumbnails.set(engine, found);
  }
  return found;
}
