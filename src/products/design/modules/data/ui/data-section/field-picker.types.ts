import type { ReactNode } from "react";

import type { PickerName } from "./picker-names.types";

export interface FieldPickerProps {
  /** What it offers, grouped by source in this order. */
  names: readonly PickerName[];
  /** The expression chosen now, ticked in the list. */
  value?: string;
  onPick: (expr: string) => void;
  /**
   * When the menu closes, before Radix puts the focus back on the trigger: `preventDefault()`
   * to focus something else (the text the pick went into).
   */
  onCloseAutoFocus?: (event: Event) => void;
  /** The button that opens it. */
  children: ReactNode;
}
