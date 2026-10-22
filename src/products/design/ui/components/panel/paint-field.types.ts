import type { Size } from "@canvas";
import type { ColorChangeInfo } from "@canvas-ui";
import type { GradientEditTarget } from "../../stores/gradient-edit-store.types";
import type { Paint } from "@design";

export interface PaintFieldProps {
  paint: Paint;
  /** Names the field for screen readers, e.g. "Fill". */
  label: string;
  /** `done` is false for the in-between steps of a drag in the picker. */
  onChange: (paint: Paint, info: ColorChangeInfo) => void;
  onRemove: () => void;
  /** Whether the paint can be an image (fills can, strokes can't yet). */
  allowImage: boolean;
  /** Which paint of the selection it is, so a gradient's handles show on the canvas. */
  target?: GradientEditTarget;
  /** The edited layer's size (one layer selected), for copying a gradient as CSS. */
  size?: Size;
}

export interface PaintSwatchProps {
  paint: Paint;
}
