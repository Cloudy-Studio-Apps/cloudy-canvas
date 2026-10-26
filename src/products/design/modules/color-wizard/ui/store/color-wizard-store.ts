import { create } from "zustand";

import { DEFAULT_WIZARD_TYPE } from "../../type";
import type { ColorWizardState } from "./color-wizard-store.types";

/** A first palette to play with, before any source is used. */
const STARTER = ["#D73220", "#F9ECE5", "#68150A", "#0B78B3", "#1F0062"];

/** The color wizard's UI state for the session (what's being built; nothing is in the file yet). */
export const useColorWizardStore = create<ColorWizardState>((set) => ({
  open: false,
  step: "colors",
  created: null,
  tab: "wheel",
  palette: STARTER.map((hex) => ({ hex, locked: false })),
  past: [],
  future: [],
  harmony: "custom",
  brightness: 0.85,
  cvd: "none",
  collection: "Brand",
  gallery: { category: "pastel", pages: 1 },
  picked: null,
  image: { assetId: null, upload: null, mood: "balanced", pins: [], readFrom: null },
  brand: { colors: ["#0B78B3"], harmony: "analogous" },
  fileMerge: 0.06,
  fileSelection: null,
  bindFills: true,
  importText: "",
  imported: [],
  roles: [],
  options: { shades: true, neutral: true, status: true, theme: true, modes: "both" },
  overrides: {},
  themeSelection: { name: "surface", mode: "Light" },
  themeView: "visual",
  type: { ...DEFAULT_WIZARD_TYPE, enabled: true },
  preview: { kind: "website", mode: "Light" },
  celebration: 0,
  set: (patch) => set(patch),
}));
