import type * as React from "react";

export interface FormHintProps {
  children: React.ReactNode;
  /** A warning instead of a note. */
  warn?: boolean;
}
