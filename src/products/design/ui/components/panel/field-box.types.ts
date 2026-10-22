import type { ReactNode } from "react";

export interface FieldBoxProps {
  children: ReactNode;
  className?: string;
  /** Outlines the box in the error color. */
  invalid?: boolean;
  /** The tooltip (e.g. the field's name, or its error). */
  title?: string;
}
