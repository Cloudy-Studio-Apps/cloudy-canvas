/** The models this user has live right now (their ids); see `isModelLive`. */
const live = new Set<string>();

/** Marks (or unmarks) a model as live in this user's editor. Called by `ModelEditLocks`. */
export function setModelLive(elementId: string, on: boolean): void {
  if (on) live.add(elementId);
  else live.delete(elementId);
}

/**
 * Whether this user has the model live. A kind's `draw` (and `drawnFrom`) reads it to skip the
 * saved picture, which would otherwise show through the live view's transparent canvas; the editor
 * redraws the element when it changes (`useModelEditSession`).
 */
export function isModelLive(elementId: string): boolean {
  return live.has(elementId);
}
