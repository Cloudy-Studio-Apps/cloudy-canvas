export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  /**
   * `bare` (the default): the select alone, its label only for screen readers and as a tooltip;
   * `inline`/`stacked`: in a `Field` with that layout.
   */
  layout?: "bare" | "inline" | "stacked";
  /** Shown while `value` is none of the options. */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
