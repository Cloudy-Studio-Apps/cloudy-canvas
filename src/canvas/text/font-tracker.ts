import { fontKey, type FontLoader, type FontRequest } from "@shared/core";

/**
 * Loads the fonts elements ask for (`ElementKind.fonts`), each face once, and reports each one
 * that becomes usable so the elements using it are drawn and measured again. Without a loader
 * (e.g. tests, a host without fonts), nothing is loaded and text uses what the browser has.
 */
export class FontTracker {
  private readonly requested = new Set<string>();
  /** Loads still running, so a host can wait for them (`settled`). */
  private readonly pending = new Set<Promise<unknown>>();
  private destroyed = false;

  constructor(
    private readonly loader: FontLoader | undefined,
    private readonly onLoad: (key: string) => void,
  ) {}

  request(fonts: Iterable<FontRequest>): void {
    if (!this.loader) return;
    for (const font of fonts) {
      const key = fontKey(font);
      if (this.requested.has(key)) continue;
      this.requested.add(key);
      const load = this.loader
        .load(font)
        .then((loaded) => {
          if (loaded && !this.destroyed) this.onLoad(key);
        })
        .catch(() => undefined)
        .finally(() => this.pending.delete(load));
      this.pending.add(load);
    }
  }

  /** Resolves once the fonts requested so far have loaded or failed. */
  async settled(): Promise<void> {
    while (this.pending.size > 0) await Promise.allSettled([...this.pending]);
  }

  destroy(): void {
    this.destroyed = true;
  }
}
