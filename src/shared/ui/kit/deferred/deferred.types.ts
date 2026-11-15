import type * as React from "react";

export interface DeferredProps {
  children: React.ReactNode;
  /** Shown for the first frame, while the children render in the background. */
  fallback?: React.ReactNode;
}

export interface PanelSkeletonProps {
  /** How many placeholder rows. */
  rows?: number;
  className?: string;
}
