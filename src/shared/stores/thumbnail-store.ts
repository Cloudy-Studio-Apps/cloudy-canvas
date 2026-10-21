import { create } from "zustand";
import type { ThumbnailState } from "./thumbnail-store.types";

export const useThumbnailStore = create<ThumbnailState>()((set) => ({
  versions: {},
  bump: (id) =>
    set(({ versions }) => ({ versions: { ...versions, [id]: (versions[id] ?? 0) + 1 } })),
}));
