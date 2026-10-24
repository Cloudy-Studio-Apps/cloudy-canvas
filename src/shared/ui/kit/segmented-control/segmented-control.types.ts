import type * as React from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Shown instead of the label when the control is `iconOnly` (the label is the tooltip). */
  icon?: React.ReactNode;
  disabled?: boolean;
  /** A tooltip (what the choice means); icon-only options show their label. */
  title?: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T | null;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  /** Its name for screen readers. */
  label: string;
  /** Icons only, the labels as tooltips. */
  iconOnly?: boolean;
  size?: "sm" | "md";
  /** Stretches across its container, options sharing the width. */
  fullWidth?: boolean;
  className?: string;
}
