import type { PairSuggestion } from "./pair-row.types";

export interface SuggestListProps {
  items: readonly PairSuggestion[];
  active: number;
  onPick: (value: string) => void;
}
