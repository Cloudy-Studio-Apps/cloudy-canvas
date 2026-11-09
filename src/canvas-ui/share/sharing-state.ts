import type { SharedFile, SharingState } from "./sharing-state.types";

let shared: SharedFile | null = null;
const listeners = new Set<() => void>();

/**
 * Which file this app shares now (and its session's awareness), set by `startSharing`/
 * `stopSharing`. Kept apart from the session (`host-session.ts`) so the app shell can follow it
 * without loading the sharing code: the file tabs mark the tab `hosting` from it and mirror the
 * room's people, editor or not.
 */
export const sharingState: SharingState = {
  fileId: () => shared?.fileId ?? null,
  current: () => shared,
  set(next) {
    if (shared === next) return;
    shared = next;
    for (const listener of listeners) listener();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
