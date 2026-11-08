/** Which links the Prototype mode draws on the canvas. */
export type PrototypeShowLinks = "all" | "selection";

export interface PrototypeViewState {
  /** The flow picked in the Flows tab (its id), or `null`. */
  selectedFlow: string | null;
  selectFlow: (id: string | null) => void;
  showLinks: PrototypeShowLinks;
  setShowLinks: (value: PrototypeShowLinks) => void;
}
