import type { ReactNode } from "react";

export interface PropertyFieldProps {
  /** A letter (X, W) or an icon shown before the value. */
  prefix: ReactNode;
  value: string;
  suffix?: string;
  label: string;
  className?: string;
}

export interface ColorFieldProps {
  color: string;
  opacity: number;
  label: string;
}

export interface PropertyRowProps {
  children: ReactNode;
  className?: string;
}
