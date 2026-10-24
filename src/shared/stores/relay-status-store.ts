import { create } from "zustand";

import type { RelayStatusState } from "./relay-status-store.types";

/** Whether live sessions had to leave the built-in relay for n0's public ones (this app run only). */
export const useRelayStatusStore = create<RelayStatusState>()((set) => ({
  builtInDownSince: null,
  setBuiltInDown: (down) => set({ builtInDownSince: down ? Date.now() : null }),
}));
