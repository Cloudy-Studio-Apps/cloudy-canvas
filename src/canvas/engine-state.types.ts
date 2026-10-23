import type { TextSelection } from "./text/rich-editor/rich-editor.types";
import type { SnapSettings } from "./snapping";

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
  /** The selected part of the single selected element (e.g. a table's `row:2`), if any. */
  selectedPart: string | null;
  /** The selection in the rich text being edited, `null` when none is (see `editingText`). */
  textSelection: TextSelection | null;
  /** The scope on screen (a design's page), `null` when the product has none. */
  scope: string | null;
  /** What snaps (the same object until it changes). */
  snapping: SnapSettings;
  /** Whether the ruler guides show (see `CanvasEngine.setGuidesShown`). */
  guidesShown: boolean;
  /** Whether the host shows its rulers (see `CanvasEngine.setRulersShown`). */
  rulersShown: boolean;
  canUndo: boolean;
  canRedo: boolean;
}
