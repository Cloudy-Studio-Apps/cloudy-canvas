import type { DataScope } from "../../bindings";
import type { RepeatSettings } from "../../repeat";

/** What `RepeatRowsFields` and `LimitFields` change: the settings a card's and a page's repeat share. */
export type RepeatRowsPatch = Partial<
  Pick<
    RepeatSettings,
    "source" | "as" | "key" | "filter" | "sort" | "limit" | "designLimit" | "previewRow"
  >
>;

export interface RepeatRowsFieldsProps {
  /** The repeat as a card repeater's settings (its `as` never empty). */
  repeat: RepeatSettings;
  /** The scope around it: where its list is read. */
  scope: DataScope;
  /** Sets the fields changed (one undo step). */
  apply: (patch: RepeatRowsPatch) => void;
}
