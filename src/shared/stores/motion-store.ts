import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MotionState } from "./motion-store.types";

/** The user's motion settings, applied to every canvas. */
export const useMotionStore = create<MotionState>()(
  persist(
    (set) => ({
      playGifs: true,
      setPlayGifs: (playGifs) => set({ playGifs }),
    }),
    { name: "cloudy-canvas:motion" },
  ),
);
