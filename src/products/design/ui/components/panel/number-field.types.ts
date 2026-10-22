import type { ReactNode } from "react";

export interface NumberFieldProps {
  /** A letter (X, W) or an icon shown before the value. */
  prefix: ReactNode;
  label: string;
  /** `null` when the selection's values differ ("Mixed"). */
  value: number | null;
  suffix?: string;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
  className?: string;
}
