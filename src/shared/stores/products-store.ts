import { create } from "zustand";

import type { ProductsState } from "./products-store.types";

/** Whether both products have loaded: Home shows first, and they load behind it. */
export const useProductsStore = create<ProductsState>()((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
}));
