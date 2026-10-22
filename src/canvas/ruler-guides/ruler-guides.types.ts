import type { CanvasDocument } from "../document";
import type { SnapAxis } from "../snapping";

/**
 * A line across the canvas dragged out of a ruler, that things snap to. On `x` it's a vertical line
 * at x = `value` (dragged out of the left ruler); on `y` a horizontal one (out of the top ruler).
 */
export interface RulerGuide {
  axis: SnapAxis;
  value: number;
}

/**
 * Where a product keeps its ruler guides (one module at most): a list per scope (a design's page),
 * stored in the document so they're saved and undoable. Without it, the canvas has no guides.
 */
export interface CanvasGuides {
  /** The guides of `scope` (`null`: a product without scopes). */
  read(doc: CanvasDocument, scope: string | null): RulerGuide[];
  /** Replaces the guides of `scope`, in the current undo step. */
  write(doc: CanvasDocument, scope: string | null, guides: readonly RulerGuide[]): void;
}
