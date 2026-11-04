import type { ReactNode } from "react";

import type { PickerName } from "./picker-names.types";

export interface FieldPickerProps {
  /** What it offers, grouped by source in this order. */
  names: readonly PickerName[];
  /** The expression chosen now, ticked in the list. */
  value?: string;
  onPick: (expr: string) => void;
  /** The button that opens it. */
  children: ReactNode;
}
