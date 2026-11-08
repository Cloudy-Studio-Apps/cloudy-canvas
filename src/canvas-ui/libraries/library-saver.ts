import type { ProjectFs } from "@shared/core";

import type { LibraryDocument } from "@canvas";

/** How long a library waits after its last edit before its file is written. */
const SAVE_DELAY_MS = 300;

/**
 * Writes changed libraries to their `.clib` files, each 300 ms after its last edit, atomically
 * (`writeBytesAtomic`), one write at a time; `flush` writes what's pending now. A failed write is
 * passed to `onError` and tried again on the next edit.
 */
export class LibrarySaver {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly pending = new Map<string, () => LibraryDocument>();
  private readonly held = new Set<string>();
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly fs: ProjectFs,
    private readonly pathOf: (libraryId: string) => string | null,
    private readonly onError: (error: unknown) => void,
  ) {}

  /** Writes `library` (read when the write runs) after the delay, restarting it on every call. */
  schedule(libraryId: string, library: () => LibraryDocument): void {
    this.pending.set(libraryId, library);
    clearTimeout(this.timers.get(libraryId));
    if (this.held.has(libraryId)) return;
    this.timers.set(
      libraryId,
      setTimeout(() => void this.write(libraryId), SAVE_DELAY_MS),
    );
  }

  /** Drops a library's pending write (it left the project). */
  cancel(libraryId: string): void {
    clearTimeout(this.timers.get(libraryId));
    this.timers.delete(libraryId);
    this.pending.delete(libraryId);
    this.held.delete(libraryId);
  }

  /** Writes one library's pending edit now and waits for every write to end. */
  flushOne(libraryId: string): Promise<void> {
    if (this.pending.has(libraryId)) void this.write(libraryId);
    return this.queue;
  }

  /**
   * Writes the library's pending edit, then keeps its later edits from being written until the
   * returned function runs (which writes them, to wherever its path is by then): for moving its file.
   */
  async hold(libraryId: string): Promise<() => void> {
    this.held.add(libraryId);
    await this.flushOne(libraryId);
    return () => {
      this.held.delete(libraryId);
      if (this.pending.has(libraryId)) void this.write(libraryId);
    };
  }

  /** Writes every pending library now and waits for every write to end. */
  async flush(): Promise<void> {
    for (const id of [...this.pending.keys()]) void this.write(id);
    await this.queue;
  }

  private write(libraryId: string): Promise<void> {
    clearTimeout(this.timers.get(libraryId));
    this.timers.delete(libraryId);
    const library = this.pending.get(libraryId);
    this.pending.delete(libraryId);
    const path = this.pathOf(libraryId);
    if (!library || !path) return this.queue;
    this.queue = this.queue.then(async () => {
      try {
        await this.fs.writeBytesAtomic(path, library().encodeFile());
      } catch (error) {
        this.onError(error);
      }
    });
    return this.queue;
  }
}
