import type * as React from "react";

export interface ChoiceCardOption<T extends string> {
  value: T;
  label: string;
  /** A line under the label. */
  hint?: string;
  /** What the choice looks like (a small SVG, a preview). */
  picture: React.ReactNode;
  disabled?: boolean;
  /** The tooltip (why it's disabled, what it means). */
  title?: string;
}

export interface ChoiceCardsProps<T extends string> {
  /** Its name for screen readers. */
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: readonly ChoiceCardOption<T>[];
  /** Cards per row. Default 2. */
  columns?: number;
  className?: string;
}
