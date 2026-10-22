import type { CanvasElement, ElementHandle, ElementKinds } from "../elements";
import type { Point, Rect } from "../geometry.types";
import type { ResizeMode } from "../handles";

export interface OverlayInput {
  kinds: ElementKinds;
  selected: CanvasElement[];
  /** The selected part of the single selected element, if any. */
  part: string | null;
  hover: CanvasElement | undefined;
  marquee: Rect | null;
  zoom: number;
  /** What the resize handles do (the Scale tool gives handles to what only scales). */
  resizeMode: ResizeMode;
}

/** An element's outline: its rect, turned by `rotation` degrees around its top-left corner. */
export interface Outline {
  rect: Rect;
  rotation: number;
}

/** What the size label shows (`w` × `h`) and the box it sits under. */
export interface SizeLabel {
  under: Rect;
  w: number;
  h: number;
}

/** Screen-space feedback drawn above the elements. All rects and points are in world units. */
export interface OverlayState {
  selection: Outline[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Outline | null;
  marquee: Rect | null;
  /** Handles the kinds of the selected and hovered elements offer (`ElementKind.handles`). */
  handles: ElementHandle[];
  /** The selection's size: one element's own (unturned), or the bounds of several. */
  size: SizeLabel | null;
  /** Resize handles of the selection (one element, or the box round several). */
  resizeHandles: Point[];
  /** Rects of the selected part of the single selected element (e.g. a table row, some cells). */
  part: Rect[];
}
