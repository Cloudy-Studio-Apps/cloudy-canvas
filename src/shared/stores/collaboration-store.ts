import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { RelaySettings, ShareIdentity } from "@shared/core";
import { BUILT_IN_RELAY } from "./built-in-relay";
import type { CollaborationState } from "./collaboration-store.types";

/** Colours people get in live sessions (like agents' fallback colours). */
const PERSON_COLORS = ["#2f7de1", "#c2410c", "#0f8a5f", "#9333ea", "#be185d", "#0e7490", "#b45309"];

/** The user's name in live sessions and the relay the sessions they host go through. */
export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set) => ({
      name: "",
      setName: (name) => set({ name: name.trim() }),
      color: PERSON_COLORS[Math.floor(Math.random() * PERSON_COLORS.length)] ?? "#2f7de1",
      relayChoice: BUILT_IN_RELAY ? "builtin" : "public",
      customRelay: { url: "", token: null },
      setRelayChoice: (relayChoice) => set({ relayChoice }),
      setCustomRelay: (customRelay) => set({ customRelay }),
    }),
    { name: "cloudy-canvas:collaboration" },
  ),
);

/**
 * The relay a hosted session goes through: the built-in or the user's own when chosen (and there),
 * otherwise `null`, n0's public ones.
 */
export function hostingRelay(state: CollaborationState): RelaySettings | null {
  const { relayChoice, customRelay } = state;
  if (relayChoice === "builtin") return BUILT_IN_RELAY;
  return relayChoice === "custom" && customRelay.url.trim() ? customRelay : null;
}

/** Who the user is in live sessions (`null` until they've picked a name). */
export function shareIdentity(state: CollaborationState): ShareIdentity | null {
  return state.name ? { name: state.name, color: state.color } : null;
}
