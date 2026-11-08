import type { PrototypeFlowElement } from "./flow.types";
import type { PrototypeInteraction, PrototypeTransition } from "./interaction.types";
import { mirrorTransition } from "./mirror-transition";
import type { OverlayEntry, PlayerResult, PlayerState } from "./player-session.types";

const INSTANT: PrototypeTransition = {
  animation: "instant",
  direction: "left",
  duration: 0,
  easing: "linear",
};

/** A new session on a flow, at its start or at the screen `at`. */
export function startSession(flow: PrototypeFlowElement, at?: string): PlayerState {
  return { flow: flow.id, stack: [{ screen: at ?? flow.start, via: null }], overlays: [] };
}

/** The screen shown under the overlays (`null` only for a state built by hand with an empty stack). */
export function currentScreen(state: PlayerState): string | null {
  return state.stack.at(-1)?.screen ?? null;
}

/**
 * What an interaction does to a session: the next state and the step to animate. Pure: the input
 * is never mutated. A `to` that `exists` rejects changes nothing.
 */
export function applyInteraction(
  state: PlayerState,
  ix: PrototypeInteraction,
  exists: (screen: string) => boolean,
): PlayerResult {
  const none: PlayerResult = { state, step: { kind: "none" } };
  const top = state.overlays.at(-1);
  const to = ix.to;
  const target = to !== undefined && exists(to) ? to : null;
  const entry = (screen: string): OverlayEntry => ({ screen, interaction: ix });

  switch (ix.action) {
    case "navigate": {
      if (target === null) return none;
      const from = currentScreen(state);
      if (from === null) return none;
      return {
        state: {
          ...state,
          stack: [...state.stack, { screen: target, via: ix.transition }],
          overlays: [],
        },
        step: { kind: "screen", from, to: target, transition: ix.transition },
      };
    }
    case "back": {
      if (top) {
        return {
          state: { ...state, overlays: state.overlays.slice(0, -1) },
          step: { kind: "closeOverlay", entry: top },
        };
      }
      const popped = state.stack.at(-1);
      const next = state.stack.slice(0, -1);
      const prev = next.at(-1);
      if (!popped || !prev) return none;
      return {
        state: { ...state, stack: next },
        step: {
          kind: "screen",
          from: popped.screen,
          to: prev.screen,
          transition: popped.via ? mirrorTransition(popped.via) : INSTANT,
        },
      };
    }
    case "overlay": {
      if (target === null) return none;
      const opened = entry(target);
      return {
        state: { ...state, overlays: [...state.overlays, opened] },
        step: { kind: "openOverlay", entry: opened },
      };
    }
    case "swap": {
      if (target === null) return none;
      const swapped = entry(target);
      if (!top) {
        return {
          state: { ...state, overlays: [swapped] },
          step: { kind: "openOverlay", entry: swapped },
        };
      }
      return {
        state: { ...state, overlays: [...state.overlays.slice(0, -1), swapped] },
        step: { kind: "swapOverlay", from: top, to: swapped },
      };
    }
    case "close":
      if (!top) return none;
      return {
        state: { ...state, overlays: state.overlays.slice(0, -1) },
        step: { kind: "closeOverlay", entry: top },
      };
    case "link":
      return ix.url ? { state, step: { kind: "link", url: ix.url } } : none;
  }
}
