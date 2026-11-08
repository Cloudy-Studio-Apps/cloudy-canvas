import { create } from "zustand";

import type { ConvertStore } from "./convert-store.types";

/** The model whose "Convert to PNG" is waiting for the user's confirmation. */
export const useConvertStore = create<ConvertStore>()((set) => ({
  id: null,
  ask: (id) => set({ id }),
  close: () => set({ id: null }),
}));
