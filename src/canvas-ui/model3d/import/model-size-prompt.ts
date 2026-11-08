import type { ModelSizeRequest } from "./model-size-dialog.types";

let current: ModelSizeRequest | null = null;
const listeners = new Set<() => void>();

function set(next: ModelSizeRequest | null): void {
  current = next;
  for (const listener of listeners) listener();
}

/** Subscribes to the pending request (for `useSyncExternalStore`). */
export function subscribeModelSize(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The pending request, or `null`. */
export function pendingModelSize(): ModelSizeRequest | null {
  return current;
}

/** Shows `request`; a request still pending is cancelled. */
export function showModelSize(request: ModelSizeRequest): void {
  current?.resolve(false);
  set(request);
}

/** Answers the pending request and hides the dialog. */
export function answerModelSize(proceed: boolean): void {
  const request = current;
  set(null);
  request?.resolve(proceed);
}
