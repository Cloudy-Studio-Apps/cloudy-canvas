import type { ReactNode } from "react";

export interface DocumentInfoPopoverProps {
  /** Classes for the button showing the name (merged over its own). */
  className?: string;
  /** Drawn after the name inside the button (e.g. a chevron). */
  children?: ReactNode;
}
