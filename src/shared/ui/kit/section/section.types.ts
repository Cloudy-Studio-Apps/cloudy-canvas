import type * as React from "react";

export interface SectionProps {
  title: React.ReactNode;
  /** Buttons at the end of its header ("+", a menu). */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Folds with a chevron in its header; `defaultOpen` (true) is how it starts. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}
