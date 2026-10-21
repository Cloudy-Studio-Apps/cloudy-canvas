export interface CustomColorSwatchProps {
  /** The current color. */
  color: string;
  /** Whether the current color is a custom one (not in the palette next to it). */
  selected: boolean;
  onSelect: (color: string) => void;
  shape?: "square" | "circle";
}
