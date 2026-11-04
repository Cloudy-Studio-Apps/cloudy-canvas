import type { PairRow } from "./pair-row.types";
import type { PairEditorProps } from "./pair-editor.types";

export interface PairEditorRowProps extends Pick<
  PairEditorProps,
  "secrets" | "hintFor" | "nameSuggestions" | "valueSuggestions" | "addPlaceholder"
> {
  row: PairRow;
  /** The empty last row: typing in it adds the row. */
  ghost: boolean;
  onChange: (row: PairRow) => void;
  onRemove: () => void;
}
