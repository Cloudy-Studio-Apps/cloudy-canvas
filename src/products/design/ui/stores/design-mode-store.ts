import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_MODE } from "@canvas";
import type { DesignModeState } from "./design-mode-store.types";

/** The mode each design was left in (e.g. Catalog), so it opens in it again. UI state only. */
export const useDesignModeStore = create<DesignModeState>()(
  persist(
    (set) => ({
      modes: {},
      remember: (fileId, mode) =>
        set(({ modes }) => {
          if ((modes[fileId] ?? DEFAULT_MODE.id) === mode) return {};
          const next = { ...modes };
          if (mode === DEFAULT_MODE.id) delete next[fileId];
          else next[fileId] = mode;
          return { modes: next };
        }),
    }),
    { name: "cloudy-canvas:design-modes" },
  ),
);
