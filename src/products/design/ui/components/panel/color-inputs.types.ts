export interface HexInputProps {
  /** `#rrggbb`. */
  color: string;
  /** Names the input for screen readers, e.g. "Fill hex". */
  label: string;
  /** Called with a valid `#rrggbb`. */
  onCommit: (color: string) => void;
  className?: string;
}

export interface PercentInputProps {
  /** 0–1, shown as 0–100. */
  value: number;
  label: string;
  /** Called with the new value, 0–1. */
  onCommit: (value: number) => void;
}
