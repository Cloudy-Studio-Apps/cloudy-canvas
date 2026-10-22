import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PluginsState } from "./plugins-store.types";

/** Which plugins run, and what happened to them when the app started. */
export const usePluginsStore = create<PluginsState>()(
  persist(
    (set) => ({
      enabled: [],
      trusted: [],
      installed: [],
      broken: [],
      statuses: {},
      needsReload: false,
      setEnabled: (id, enabled) =>
        set((state) => ({
          enabled: enabled
            ? [...new Set([...state.enabled, id])]
            : state.enabled.filter((other) => other !== id),
          needsReload: true,
        })),
      trust: (id) => set((state) => ({ trusted: [...new Set([...state.trusted, id])] })),
      setLoaded: (loaded) => set(loaded),
      setStatus: (status) =>
        set((state) => ({ statuses: { ...state.statuses, [status.id]: status } })),
      markNeedsReload: () => set({ needsReload: true }),
    }),
    {
      name: "cloudy-canvas:plugins",
      partialize: ({ enabled, trusted }) => ({ enabled, trusted }),
    },
  ),
);
