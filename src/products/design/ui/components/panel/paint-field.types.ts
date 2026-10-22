import type { Paint } from "@design";

export interface PaintFieldProps {
  paint: Paint;
  /** Names the field for screen readers, e.g. "Fill". */
  label: string;
  onChange: (paint: Paint) => void;
  onRemove: () => void;
}
