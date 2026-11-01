import type * as React from "react";

export interface ToggleTileProps {
  /** What it looks like on the board. */
  picture: React.ReactNode;
  label: string;
  /** What it means, in a few words. */
  hint: string;
  on: boolean;
  /** Why it can't be turned on, or more about it. */
  title?: string | undefined;
  disabled?: boolean | undefined;
  /** The picture above the text instead of beside it. */
  stacked?: boolean;
  onToggle: () => void;
}
