import type { SharedFile, SharingState } from "./sharing-state.types";

let shared: SharedFile | null = null;
let knocks = 0;
const listeners = new Set<() => void>();

/**
 * Which file this app shares now (and its session's awareness, and how many people knock), set by
 * `startSharing`/`stopSharing`. Kept apart from the session (`host-session.ts`) so the app shell can follow it
 * without loading the sharing code: the file tabs mark the tab `hosting` from it, mirror the
 * room's people and show the knocks, editor or not.
 */
export const sharingState: SharingState = {
  fileId: () => shared?.fileId ?? null,
  current: () => shared,
  set(next) {
    if (shared === next) return;
    shared = next;
    if (!next) knocks = 0;
    notify();
  },
  knocks: () => knocks,
  setKnocks(count) {
    if (knocks === count) return;
    knocks = count;
    notify();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function notify(): void {
  for (const listener of listeners) listener();
}
