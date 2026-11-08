import { create } from "zustand";

import type { PlayerStoreState } from "./player-store.types";

/** The player's target: set by Play (the command, a flow's ▶, its flag), cleared by Close. */
export const usePlayerStore = create<PlayerStoreState>()((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}));
