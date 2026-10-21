/** Snapshot for UI hosts (immutable; replaced on every change). `O` is the product's tool options. */
export interface EngineState<O extends object = object> {
  /** The active tool's id. */
  tool: string;
  options: O;
  zoom: number;
  selectionCount: number;
  /** Sorted, comma-separated types of the selected elements, e.g. "geo,sticky". */
  selectionTypes: string;
  canUndo: boolean;
  canRedo: boolean;
}
