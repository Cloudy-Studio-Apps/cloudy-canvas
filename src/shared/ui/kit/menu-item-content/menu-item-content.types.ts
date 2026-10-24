import type * as React from "react";

export interface MenuItemContentProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** A formatted shortcut, shown at the end. */
  shortcut?: string;
  /** A tick at the end (instead of the shortcut). */
  checked?: boolean;
}
