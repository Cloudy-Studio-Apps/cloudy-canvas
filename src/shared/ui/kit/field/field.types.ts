import type * as React from "react";

export interface FieldProps {
  label: React.ReactNode;
  /** A line under the control (or under the label, `inline`). */
  hint?: React.ReactNode;
  /** Replaces the hint, in the destructive color. */
  error?: React.ReactNode;
  /** `stacked` (label above, the default) or `inline` (label and hint left, control right). */
  layout?: "stacked" | "inline";
  /**
   * The control. As a function it gets the id to put on its input, so the label points at it;
   * otherwise give the control `id={useFieldId()}`.
   */
  children: React.ReactNode | ((id: string) => React.ReactNode);
  className?: string;
}
