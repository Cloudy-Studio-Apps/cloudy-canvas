import type { ComponentProps, ReactNode } from "react";

import type { PlacedToolEntry } from "../editor-points.types";
import type { ModeToolbarEntry } from "../mode-toolbar.types";

export interface PhoneToolbarProps {
  /** What the sheet lists. */
  children: ReactNode;
  /** The buttons for the selection, on the bar. */
  actions?: ReactNode;
  /** Last on the bar (e.g. a mode's Done). */
  trailing?: ReactNode;
}

export interface PhoneToolCellProps extends ComponentProps<"button"> {
  icon: ReactNode;
  label: string;
  active?: boolean | undefined;
}

export interface PhoneToolGridProps {
  groups: readonly (readonly PlacedToolEntry[])[];
}

export interface PhoneModeItemsProps {
  items: readonly ModeToolbarEntry[];
}

export interface PhoneModeItemProps {
  item: Exclude<ModeToolbarEntry, "divider">;
}
