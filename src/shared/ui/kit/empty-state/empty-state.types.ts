import type * as React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A button or two to start with. */
  action?: React.ReactNode;
  className?: string;
}
