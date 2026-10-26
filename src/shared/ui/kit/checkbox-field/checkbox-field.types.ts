export interface CheckboxFieldProps {
  label: string;
  /** `"mixed"` for a selection whose values differ. */
  checked: boolean | "mixed";
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}
