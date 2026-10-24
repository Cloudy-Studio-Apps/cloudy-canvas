import { create } from "zustand";

import { EMPTY_COLLABORATOR_STATE, type Collaborator } from "@shared/core";
import type { CollaboratorsState } from "./collaborators-store.types";

/** A collaborator silent this long is shown idle (faded). */
export const COLLABORATOR_IDLE_MS = 20_000;
/** A collaborator silent this long is no longer shown. */
export const COLLABORATOR_GONE_MS = 10 * 60_000;

/**
 * Who else works on the user's files (`Collaborator`s, written by presence sources such as the
 * agent server) and who the user follows. Never saved.
 */
export const useCollaboratorsStore = create<CollaboratorsState>()((set) => {
  /** The collaborators without some of them; `following` is cleared when it's one of them. */
  const without = (state: CollaboratorsState, gone: (c: Collaborator) => boolean) => {
    const kept = Object.values(state.collaborators).filter((c) => !gone(c));
    if (kept.length === Object.keys(state.collaborators).length) return state;
    const collaborators = Object.fromEntries(kept.map((c) => [c.id, c]));
    const following = state.following && collaborators[state.following] ? state.following : null;
    return { collaborators, following };
  };

  return {
    collaborators: {},
    following: null,
    join: (identity) =>
      set((state) => {
        const now = Date.now();
        const current = state.collaborators[identity.id];
        const next: Collaborator = current
          ? { ...current, ...identity, lastSeen: now }
          : {
              ...identity,
              connectedAt: now,
              lastSeen: now,
              running: 0,
              state: EMPTY_COLLABORATOR_STATE,
            };
        return { collaborators: { ...state.collaborators, [identity.id]: next } };
      }),
    patch: (id, patch, meta) =>
      set((state) => {
        const current = state.collaborators[id];
        if (!current) return state;
        const next = { ...current, ...meta, state: { ...current.state, ...patch } };
        return { collaborators: { ...state.collaborators, [id]: next } };
      }),
    leave: (id) => set((state) => without(state, (c) => c.id === id)),
    clearSource: (source) => set((state) => without(state, (c) => c.source === source)),
    follow: (following) => set((state) => (state.collaborators[following] ? { following } : state)),
    unfollow: () => set({ following: null }),
    prune: (now) =>
      set((state) =>
        without(state, (c) => c.running === 0 && now - c.lastSeen >= COLLABORATOR_GONE_MS),
      ),
  };
});

/** The collaborator hasn't done anything for a while and isn't running anything. */
export function collaboratorIsIdle(collaborator: Collaborator, now: number): boolean {
  return collaborator.running === 0 && now - collaborator.lastSeen >= COLLABORATOR_IDLE_MS;
}
