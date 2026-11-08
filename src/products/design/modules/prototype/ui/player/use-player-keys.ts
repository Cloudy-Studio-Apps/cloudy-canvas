import { useEffect, useRef } from "react";

import { isTypingTarget, matchesShortcut } from "@shared/core";
import { PLAYER_KEYS } from "./player-keys";
import { activeSurface } from "./trigger-hits";
import type { PlayerKeysOptions } from "./use-player-keys.types";

/**
 * The player's keys while it's open: first a key press interaction on what's showing (the top
 * overlay or the screen, its `key` compared case-insensitively), then Esc closes, R restarts, H
 * keeps the hotspots shown and Alt+← goes back. The flow picker keeps its own keys.
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
      if (isTypingTarget(event.target) || inPicker(event.target) || !handle(event)) return;
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

/** Whether a key goes to the flow picker (its button or its open list). */
function inPicker(target: EventTarget | null): boolean {
  return (
    target instanceof Element && target.closest("[role='combobox'], [role='listbox']") !== null
  );
}
