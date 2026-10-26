import type { ScaleAnchor } from "@canvas";

export interface AnchorPickerProps {
  value: ScaleAnchor;
  onChange: (anchor: ScaleAnchor) => void;
  /** The grid's accessible name (default "Anchor"). */
  label?: string;
}
