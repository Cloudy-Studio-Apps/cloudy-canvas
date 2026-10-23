import type { ImageTransform, Point } from "@canvas";

import type { OverlayFrame } from "../../overlay";

/** An element's box and where its picture sits in it, as the crop overlay edits them. */
export interface ImageCropValue {
  frame: OverlayFrame;
  transform: ImageTransform;
}

/** A side or corner of the crop box: -1 the left/top edge, 1 the right/bottom one, 0 neither. */
export interface CropEdge {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

/** What a crop drag holds: the picture, one of its corners (by index), or an edge of the box. */
export type CropGrip =
  { kind: "pan" } | { kind: "zoom"; corner: number } | { kind: "edge"; edge: CropEdge };

/** Where a crop drag is: the pointer in the element's own frame, as it was when the drag began. */
export interface CropDrag {
  start: ImageCropValue;
  /** The pointer when the drag began and now, in the element's frame (world units, unturned). */
  from: Point;
  to: Point;
  /** Shift: the crop box keeps its proportions. */
  keepRatio: boolean;
  /** Alt: the picture scales round its middle. */
  fromCenter: boolean;
  /** Keep the crop box inside the picture (nothing past its edges shows). */
  clamp: boolean;
}

export interface ImageCropOverlayProps {
  /** The element's box (world units). */
  frame: OverlayFrame;
  /** Where its picture sits in the box. */
  transform: ImageTransform;
  /** The picture, for the DOM (`useAssetUrl`). */
  url: string | null;
  /** Whether the crop box's sides and corners can be dragged (they resize the element). */
  resizable?: boolean;
  /** Keep the crop inside the picture (board images); otherwise it can show past it. */
  clamp?: boolean;
  /** A step of a drag; `checkpoint` is true on its first (a new undo step). */
  onChange: (value: ImageCropValue, checkpoint: boolean) => void;
  /** Enter or Esc: the crop is finished. */
  onDone: () => void;
}
