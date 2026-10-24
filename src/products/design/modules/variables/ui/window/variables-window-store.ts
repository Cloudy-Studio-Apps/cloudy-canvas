import { create } from "zustand";

import type { VariablesWindowState } from "./variables-window.types";

/** The Variables window's UI state for the session (what's shown, picked, being generated). */
export const useVariablesWindowStore = create<VariablesWindowState>((set) => ({
  open: false,
  collectionId: null,
  axisId: null,
  view: "all",
  query: "",
  selectedId: null,
  draft: null,
  scaleDraft: null,
  position: null,
  setOpen: (open) => set({ open }),
  showCollection: (collectionId) =>
    set({ collectionId, selectedId: null, draft: null, scaleDraft: null, query: "" }),
  setAxis: (axisId) => set({ axisId, view: "all" }),
  setView: (view) => set({ view }),
  setQuery: (query) => set({ query }),
  select: (selectedId) => set({ selectedId, draft: null, scaleDraft: null }),
  setDraft: (draft) => set({ draft, scaleDraft: null }),
  setScaleDraft: (scaleDraft) => set({ scaleDraft, draft: null }),
  setPosition: (position) => set({ position }),
}));
