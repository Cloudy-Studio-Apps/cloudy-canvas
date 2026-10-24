import type * as React from "react";

export interface ListRowProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Shown first (an icon, a swatch). */
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** Muted text after the label (a count, a value). */
  meta?: React.ReactNode;
  /** Buttons at the end, shown while the row is hovered, focused or selected. */
  actions?: React.ReactNode;
  selected?: boolean;
  /** Picks the row (click, Enter, Space). Without it the row isn't a button. */
  onSelect?: () => void;
  /** Its level in a tree, indenting it. */
  depth?: number;
  /** Dims it (hidden, missing). */
  muted?: boolean;
  /** `sm` (the theme's row height, small text: layers, pages) or `md` (pickers, lists in panels). */
  size?: "sm" | "md";
}
