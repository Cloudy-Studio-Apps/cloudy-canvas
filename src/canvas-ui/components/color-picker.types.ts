export interface ColorPickerProps {
  /** Current color, as `#rrggbb`. */
  color: string;
  /** Called with a `#rrggbb` color once it's picked (not on every step of a drag). */
  onChange: (color: string) => void;
}
