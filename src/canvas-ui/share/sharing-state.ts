import type { SharingState } from "./sharing-state.types";

let current: string | null = null;
const listeners = new Set<() => void>();

/**
 * Which file this app shares now, set by `startSharing`/`stopSharing`. Kept apart from the session
 * (`host-session.ts`) so the app shell can follow it without loading the sharing code: the file
 * tabs mark the tab `hosting` from it, editor or not.
 */
export const sharingState: SharingState = {
  fileId: () => current,
  set(fileId) {
    if (current === fileId) return;
    current = fileId;
    for (const listener of listeners) listener();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
