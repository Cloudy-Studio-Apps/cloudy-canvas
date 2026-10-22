import type { FontFamily } from "@shared/core";

export interface FontPickerProps {
  /** The selection's family, or `null` when it's mixed. */
  family: string | null;
  onPick: (family: FontFamily) => void;
}

export interface FontListProps {
  families: readonly FontFamily[];
  current: string | null;
  onPick: (family: FontFamily) => void;
}
