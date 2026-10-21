/** Snapshot for UI hosts (immutable; replaced on every change). `O` is the product's tool options. */
export interface EngineState<O extends object = object> {
  /** The active tool's id. */
  tool: string;
  options: O;
  zoom: number;
  selectionCount: number;
  /** Selected ids (the same array until the selection changes). */
  selectedIds: readonly string[];
  /** The selected element's id when exactly one is selected. */
  selectedId: string | null;
  /** Sorted, comma-separated types of the selected elements, e.g. "geo,sticky". */
  selectionTypes: string;
  canUndo: boolean;
  canRedo: boolean;
}
