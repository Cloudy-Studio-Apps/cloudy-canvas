import type { CanvasDocument } from "../document";
import { Emitter } from "../utils";

/**
 * Notifies when a document's variables or collections change (for `useSyncExternalStore`). It
 * observes them only while someone listens, so it needs no cleanup.
 */
export class TokenFeed {
  private readonly emitter = new Emitter();
  private version = 0;
  private listeners = 0;
  private unobserve: (() => void) | null = null;

  constructor(private readonly doc: CanvasDocument) {}

  subscribe = (listener: () => void): (() => void) => {
    const off = this.emitter.subscribe(listener);
    if (this.listeners++ === 0) {
      this.version++;
      this.unobserve = this.doc.observeTokens(() => {
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

  getVersion = (): number => this.version;
}
