export interface ColorPaletteProps {
  /** Document content colors (not theme tokens). */
  colors: readonly { name: string; value: string }[];
  /** The current color, from the palette or a custom one. */
  value: string;
  onSelect: (color: string) => void;
  shape?: "square" | "circle";
  /** Whether a swatch for any other color is offered (the app's color picker). Default true. */
  allowCustom?: boolean;
  /** A swatch's name from its color's (e.g. "Blue fill"); its color's name when unset. */
  labelOf?: (color: { name: string; value: string }) => string;
  /** No swatch shows as picked (the color comes from elsewhere, e.g. a variable). */
  noneSelected?: boolean;
}
