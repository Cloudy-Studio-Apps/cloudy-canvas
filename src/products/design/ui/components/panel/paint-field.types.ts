import type { ColorChangeInfo } from "@canvas-ui";
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
}

export interface PaintSwatchProps {
  paint: Paint;
}
