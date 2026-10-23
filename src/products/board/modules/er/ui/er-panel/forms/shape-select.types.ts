export interface ShapeSelectOption {
  value: string;
  label: string;
}

export interface ShapeSelectProps {
  value: string;
  options: readonly ShapeSelectOption[];
  onChange: (value: string) => void;
  "aria-label": string;
  /** Shown (and selectable as "") when nothing is chosen. */
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}
