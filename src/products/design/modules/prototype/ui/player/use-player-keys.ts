import { useEffect, useRef } from "react";

import { isTypingTarget, matchesShortcut } from "@shared/core";
import { PLAYER_KEYS } from "./player-keys";
import { activeSurface } from "./trigger-hits";
import type { PlayerKeysOptions } from "./use-player-keys.types";

/**
 * The player's keys while it's open: first a key press interaction on what's showing (the top
 * overlay or the screen, its `key` compared case-insensitively), then Esc closes, R restarts, H
 * keeps the hotspots shown and Alt+← goes back. The flow picker keeps the keys of its open list
 * and those that open it.
 *
 * The editor's shortcuts (`bindKeyboard`, on the window as keys bubble up) never run meanwhile:
 * the player's keys are taken on the way down, and every other key stops at the document, after
 * the player's own controls had it but before the window.
 */
export function usePlayerKeys({ run, surfaces, onClose, onToggleHints }: PlayerKeysOptions): void {
  const latest = useRef({ surfaces, onClose, onToggleHints });
  useEffect(() => {
    latest.current = { surfaces, onClose, onToggleHints };
  });

  useEffect(() => {
    const handle = (event: KeyboardEvent): boolean => {
      const { surfaces: now, onClose: close, onToggleHints: toggle } = latest.current;
      const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
      const key = event.key.toLowerCase();
      const pressed = plain
        ? activeSurface(now)
            ?.targets.flatMap((target) => target.interactions)
            .find((ix) => ix.trigger === "key" && ix.key?.toLowerCase() === key)
        : undefined;
      if (pressed) void run.run(pressed);
      else if (matchesShortcut(event, PLAYER_KEYS.close)) close();
      else if (matchesShortcut(event, PLAYER_KEYS.restart)) run.restart();
      else if (matchesShortcut(event, PLAYER_KEYS.hints)) toggle();
      else if (matchesShortcut(event, PLAYER_KEYS.back)) run.back();
      else return false;
      return true;
    };
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || inPicker(event) || !handle(event)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const hold = (event: KeyboardEvent) => event.stopPropagation();
    window.addEventListener("keydown", onKey, { capture: true });
    document.addEventListener("keydown", hold);
    return () => {
      window.removeEventListener("keydown", onKey, { capture: true });
      document.removeEventListener("keydown", hold);
    };
  }, [run]);
}

/** The keys the flow picker's button opens its list with. */
const PICKER_KEYS = new Set(["Enter", " ", "ArrowUp", "ArrowDown"]);

/**
 * Whether a key belongs to the flow picker: anything while its list is open, or a key that opens
 * it while its button has the focus. Esc and the player's other keys still work on the button.
 */
function inPicker(event: KeyboardEvent): boolean {
  const { target } = event;
  if (!(target instanceof Element)) return false;
  if (target.closest("[role='listbox']")) return true;
  return target.closest("[role='combobox']") !== null && PICKER_KEYS.has(event.key);
}
