import type { ReactNode } from "react";

export interface NumberFieldProps {
  /** A letter (X, W) or an icon shown before the value; dragging it scrubs the value. */
  prefix: ReactNode;
  label: string;
  /** `null` when the selection's values differ ("Mixed"). */
  value: number | null;
  suffix?: string;
  min?: number;
  max?: number;
  /** What Up/Down add (Shift: ×10), and a pixel of scrubbing unless `scrubStep` says. */
  step?: number;
  scrubStep?: number;
  /** Shown and typed as this many times the value (a 0–1 value as a percentage: 100). */
  factor?: number;
  decimals?: number;
  /** Every change: a typed value, an arrow key, each step of a scrub. */
  onCommit: (value: number) => void;
  className?: string;
}
