import { useEffect, useState } from "react";

import { prefersReducedMotion } from "@canvas";
import { TURN_MS } from "./page-turn";
import type { PageTurn, PageTurnState } from "./preview.types";

/**
 * The spread change being animated, from the last spread shown to `spread`, for as long as a
 * page takes to turn; `null` at rest, when `enabled` is off or with reduced motion.
 */
export function usePageTurn(spread: number, enabled: boolean): PageTurn | null {
  const [state, setState] = useState<PageTurnState>({ spread, turn: null, count: 0 });

  useEffect(() => {
    const id = state.turn?.id;
    if (id === undefined) return;
    const timer = setTimeout(
      () => setState((now) => (now.turn?.id === id ? { ...now, turn: null } : now)),
      TURN_MS,
    );
    return () => clearTimeout(timer);
  }, [state.turn]);

  // A new spread starts a turn as it's rendered, so its first frame already shows it.
  if (state.spread !== spread) {
    const count = state.count + 1;
    const animates = enabled && state.spread >= 0 && spread >= 0 && !prefersReducedMotion();
    const turn = animates ? { from: state.spread, to: spread, id: count } : null;
    setState({ spread, turn, count });
    return turn;
  }
  return enabled ? state.turn : null;
}
