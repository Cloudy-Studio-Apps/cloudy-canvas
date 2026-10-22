import type { CanvasDocument } from "../document";
import type { Rect } from "../geometry.types";
import type { SnapAxis } from "../snapping";

/**
 * A line dragged out of a ruler, that things snap to. On `x` it's a vertical line (dragged out of
 * the left ruler), on `y` a horizontal one (out of the top ruler). A page guide crosses the whole
 * canvas at `value`; a frame's guide (`frame`, the element it belongs to) shows only inside that
 * element, `value` from its top-left corner, and moves with it.
 */
export interface RulerGuide {
  axis: SnapAxis;
  value: number;
  frame?: string;
}

/**
 * A guide where it shows: its world `value` and, for a frame's guide, the area it's drawn in. A
 * turned frame's guide turns with it: `value` and `within` are then in the frame's unturned
 * frame, turned by `rotation` round `within`'s corner.
 */
export interface PlacedGuide {
  /** Its index in the scope's list. */
  index: number;
  axis: SnapAxis;
  /** World units (in the frame's unturned frame when it's turned). */
  value: number;
  /** The frame it belongs to, if any. */
  frame: string | null;
  /** Where it shows: the frame's (unturned) bounds, or `null` across the whole canvas. */
  within: Rect | null;
  /** The frame's turn (degrees counterclockwise round `within`'s corner); 0 for page guides. */
  rotation: number;
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
