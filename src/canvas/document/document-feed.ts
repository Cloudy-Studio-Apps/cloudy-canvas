import { Emitter } from "../utils";
import type { CanvasDocument } from "./canvas-document";
import type { DocumentChange } from "./canvas-document.types";

/**
 * Notifies when the part of a document someone cares about changes (works with React's
 * `useSyncExternalStore`). The document is only observed while someone listens, so a feed needs
 * no cleanup and can be created freely (e.g. in a `useMemo`).
 */
export class DocumentFeed {
  private readonly emitter = new Emitter();
  private version = 0;
  private listeners = 0;
  private unobserve: (() => void) | null = null;

  constructor(
    private readonly doc: CanvasDocument,
    /** Whether a change concerns this feed. */
    private readonly touches: (change: DocumentChange) => boolean,
  ) {}

  subscribe = (listener: () => void): (() => void) => {
    const off = this.emitter.subscribe(listener);
    if (this.listeners++ === 0) {
      // Changes made while nobody listened weren't counted.
      this.version++;
      this.unobserve = this.doc.observe((change) => {
        if (!this.touches(change)) return;
        this.version++;
        this.emitter.emit();
      });
    }
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      off();
      if (--this.listeners > 0) return;
      this.unobserve?.();
      this.unobserve = null;
    };
  };

  /** Increments on every change the feed cares about. */
  getVersion = (): number => this.version;
}
