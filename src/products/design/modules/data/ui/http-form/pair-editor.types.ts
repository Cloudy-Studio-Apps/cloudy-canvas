import type { PairRow, PairSuggestion } from "./pair-row.types";

export interface PairEditorProps {
  rows: readonly PairRow[];
  onChange: (rows: PairRow[]) => void;
  /** The name column's heading. */
  nameLabel: string;
  /** What the empty last row says (typing in it adds a row). */
  addPlaceholder: string;
  /** Rows can keep their value on this device (a lock per row). */
  secrets?: boolean;
  /** A line under a row saying what its name is for. */
  hintFor?: (name: string) => string | undefined;
  nameSuggestions?: (query: string) => PairSuggestion[];
  valueSuggestions?: (name: string, query: string) => PairSuggestion[];
  /** A new row with this name starts private. */
  autoSecret?: (name: string) => boolean;
}
