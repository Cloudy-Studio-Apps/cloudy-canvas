import type { RichSnapshot } from "./rich-editor.types";

/** Typing within this long of the last change joins its undo step. */
const JOIN_MS = 600;
/** Steps kept. */
const LIMIT = 200;

/**
 * A rich editing session's own undo history (the document's records the session as one step
 * when it ends): snapshots before each change, typing bursts joined into one.
 */
export class SessionHistory {
  private readonly past: RichSnapshot[] = [];
  private future: RichSnapshot[] = [];
  private lastTyped = 0;

  /** Records the state before a change; `typing` joins quick keystrokes into one step. */
  record(before: RichSnapshot, typing: boolean): void {
    const now = performance.now();
    const joined = typing && now - this.lastTyped < JOIN_MS;
    this.lastTyped = typing ? now : 0;
    this.future = [];
    if (joined) return;
    this.past.push(before);
    if (this.past.length > LIMIT) this.past.shift();
  }

  /** The state to go back to, given the current one (`null`: nothing to undo). */
  undo(current: RichSnapshot): RichSnapshot | null {
    const previous = this.past.pop();
    if (!previous) return null;
    this.future.push(current);
    this.lastTyped = 0;
    return previous;
  }

  redo(current: RichSnapshot): RichSnapshot | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(current);
    this.lastTyped = 0;
    return next;
  }
}
