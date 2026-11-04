import { useState, type KeyboardEvent } from "react";

import type { PairSuggestion } from "./pair-row.types";
import type { SuggestState } from "./use-suggest.types";

/**
 * Suggestions while a field is focused: Up and Down move, Enter or Tab picks, Escape hides them
 * (without closing the dialog around).
 */
export function useSuggest(
  open: boolean,
  items: PairSuggestion[],
  onPick: (value: string) => void,
): SuggestState {
  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(false);
  const shown = open && !hidden ? items : [];
  const current = Math.min(active, Math.max(0, shown.length - 1));
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (shown.length === 0) {
      if (event.key === "ArrowDown") setHidden(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : shown.length - 1;
      setActive((current + step) % shown.length);
    } else if (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey)) {
      const item = shown[current];
      if (!item) return;
      event.preventDefault();
      setActive(0);
      onPick(item.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setHidden(true);
    } else {
      setHidden(false);
      setActive(0);
    }
  };
  return { items: shown, active: current, onKeyDown, close: () => setHidden(true) };
}
