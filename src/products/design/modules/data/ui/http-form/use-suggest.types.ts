import type { KeyboardEvent } from "react";

import type { PairSuggestion } from "./pair-row.types";

/** Suggestions for one field: the active one and the keys that move through and pick them. */
export interface SuggestState {
  items: PairSuggestion[];
  active: number;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  close: () => void;
}
