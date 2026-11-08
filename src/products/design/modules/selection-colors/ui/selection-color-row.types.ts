import type { ColorChangeInfo, ColorValue } from "@canvas-ui";
import type { SelectionColor } from "../selection-colors.types";

export interface SelectionColorRowProps {
  entry: SelectionColor;
  onChange: (next: ColorValue, info: ColorChangeInfo) => void;
  /** Selects the layers that use the color. */
  onSelect: () => void;
}
