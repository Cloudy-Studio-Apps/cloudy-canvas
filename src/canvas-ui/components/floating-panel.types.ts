import type { ComponentProps } from "react";

export interface FloatingPanelProps extends ComponentProps<"div"> {
  /** For a horizontal bar that may not fit a phone: it scrolls sideways there. */
  scrollsOnPhones?: boolean;
}

export interface PanelDividerProps {
  className?: string;
}
