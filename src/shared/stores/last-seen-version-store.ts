import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { LastSeenVersionState } from "./last-seen-version-store.types";

/** The version the "Updated" notice last ran for, so it shows once after each update. */
export const useLastSeenVersionStore = create<LastSeenVersionState>()(
  persist(
    (set) => ({
      version: null,
      see: (version) => set({ version }),
    }),
    { name: "cloudy-canvas:last-seen-version" },
  ),
);
