export interface DesignViewState {
  /** Whether the rulers show along the canvas's top and left edges. */
  rulers: boolean;
  /** Whether the ruler guides show. */
  guides: boolean;
  setRulers: (rulers: boolean) => void;
  setGuides: (guides: boolean) => void;
}
