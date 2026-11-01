import type * as React from "react";

export interface ShapeLinkProps {
  /** The shape it selects. */
  id: string;
  label: string;
  children?: React.ReactNode;
  className?: string;
}
