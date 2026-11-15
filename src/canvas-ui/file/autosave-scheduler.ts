import {
  AUTOSAVE_DELAY_MS,
  AUTOSAVE_MAX_WAIT_MS,
  MAX_WAIT_PER_SAVE_COST,
  OVERDUE_PAUSE_MS,
  QUIET_PER_SAVE_COST,
} from "./autosave-delays";
import { lastInputAt } from "./last-input";

/**
 * When an autosave runs: once the document and the user's input have both been still for a while
 * (`AUTOSAVE_DELAY_MS`, or three times what the last save took, for files whose encoding stops the
 * UI), or, after a long stretch of editing, at the next short pause. So a save never lands in the
 * middle of a drag, a zoom or typing.
 */
export class AutosaveScheduler {
  private timer: ReturnType<typeof setTimeout> | undefined;
  /** When the first change not yet saved came, `null` with nothing pending. */
  private pendingSince: number | null = null;
  private lastChange = 0;
  /** How long the last saves took to start (their encoding, on this thread), in ms. */
  private cost = 0;

  constructor(private readonly save: (force: boolean) => Promise<void>) {
    lastInputAt();
  }

  /** The document changed: save once things are still. */
  changed(): void {
    const now = performance.now();
    this.lastChange = now;
    this.pendingSince ??= now;
    this.arm(this.quiet());
  }

  /** Forgets the pending save (it ran another way, or autosave stopped). */
  cancel(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.pendingSince = null;
  }

  /** Saves now, timing what it costs this thread so later saves wait long enough. */
  run(force = false): Promise<void> {
    this.cancel();
    const start = performance.now();
    const saving = this.save(force);
    // A save with nothing to write costs nothing: the last real cost fades rather than resets.
    this.cost = Math.max(this.cost / 2, performance.now() - start);
    return saving;
  }

  private quiet(): number {
    return Math.max(AUTOSAVE_DELAY_MS, this.cost * QUIET_PER_SAVE_COST);
  }

  private arm(ms: number): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.tick, ms);
  }

  private readonly tick = (): void => {
    if (this.pendingSince === null) return;
    const now = performance.now();
    const still = now - Math.max(this.lastChange, lastInputAt());
    const maxWait = Math.max(AUTOSAVE_MAX_WAIT_MS, this.cost * MAX_WAIT_PER_SAVE_COST);
    const needed = now - this.pendingSince >= maxWait ? OVERDUE_PAUSE_MS : this.quiet();
    if (still >= needed) void this.run();
    else this.arm(needed - still);
  };
}
