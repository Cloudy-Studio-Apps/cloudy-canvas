import type { GeneratorInput, ScaleInput } from "@canvas";

/** Where the window was dragged to (in the canvas area). */
export interface WindowPosition {
  left: number;
  top: number;
}

/** The Variables window's UI state (never content: that's the document's). */
export interface VariablesWindowState {
  open: boolean;
  /** The collection shown (the first when unset or gone). */
  collectionId: string | null;
  /** The mode axis the board shows (the first with several modes when unset). */
  axisId: string | null;
  /** `"all"`, or the one mode the board shows. */
  view: string;
  query: string;
  /** The variable in the inspector. */
  selectedId: string | null;
  /** The shade generator being set up (the inspector shows it, the board previews it). */
  draft: GeneratorInput | null;
  /** The number scale being set up (the inspector shows it, the board previews it). */
  scaleDraft: ScaleInput | null;
  position: WindowPosition | null;
  /** The board lists the unused variables and styles instead of a collection. */
  showingUnused: boolean;
  setOpen: (open: boolean) => void;
  showCollection: (id: string) => void;
  setAxis: (id: string) => void;
  setView: (view: string) => void;
  setQuery: (query: string) => void;
  select: (id: string | null) => void;
  setDraft: (draft: GeneratorInput | null) => void;
  setScaleDraft: (draft: ScaleInput | null) => void;
  setPosition: (position: WindowPosition | null) => void;
  showUnused: (showing: boolean) => void;
}
