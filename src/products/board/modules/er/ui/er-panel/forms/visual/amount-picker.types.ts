export interface AmountPickerProps {
  /** Its name for screen readers. */
  label: string;
  min: string;
  max: string;
  onChange: (min: string, max: string) => void;
}

export interface AmountDotsProps {
  min: string;
  max: string;
}
