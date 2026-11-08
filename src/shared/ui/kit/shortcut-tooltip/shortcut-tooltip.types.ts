import type * as React from "react";

export interface ShortcutTooltipProps {
  /** The control's name. */
  label: string;
  /** A shortcut shown as a key cap after the label (already formatted). */
  shortcut?: string;
  /** A line under the label. */
  description?: string;
  /** Where it opens. */
  side?: "top" | "bottom" | "left" | "right";
  /** The control it describes (its trigger, through `asChild`). */
  children: React.ReactNode;
}
