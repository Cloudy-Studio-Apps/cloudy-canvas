import type { ErIssue, ErNotation, ErStandard } from "@board";

/** A diagram setting the settings page shows: the attribute look or one of the notation's. */
export type ErSettingKey =
  | "style"
  | "cardinality"
  | "ratio"
  | "participation"
  | "isa"
  | "crowFeet"
  | "dependency"
  | "arrows";

/** One setting with its choices (values as the text writes them; crow's feet `on`/`off`). */
export interface ErSettingChoice {
  key: ErSettingKey;
  label: string;
  /** What the setting is about, under its title. */
  hint: string;
  options: readonly { value: string; label: string }[];
}

/** What the settings page reads of the shown diagram. */
export interface ErDiagramLook {
  notation: ErNotation;
  style: string;
}

export interface ErSettingOptionProps {
  setting: ErSettingKey;
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export interface ErSettingPreviewProps {
  setting: ErSettingKey;
  value: string;
}

export interface ErStandardPickerProps {
  standard: ErStandard;
  /** Picks a standard: the diagram follows it, its own overrides dropped. */
  onPick: (standard: ErStandard) => void;
}

export interface ErCheckListProps {
  issues: readonly ErIssue[];
}
