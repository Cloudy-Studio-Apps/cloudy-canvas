export interface ColorPaletteProps {
  /** Document content colors (not theme tokens). */
  colors: readonly { name: string; value: string }[];
  /** The current color, from the palette or a custom one. */
  value: string;
  onSelect: (color: string) => void;
  shape?: "square" | "circle";
  /** Whether a swatch for any other color is offered. */
  allowCustom?: boolean;
}
