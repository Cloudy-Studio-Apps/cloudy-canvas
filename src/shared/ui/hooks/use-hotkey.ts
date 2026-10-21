import { useEffect, useRef } from "react";

import { isTypingTarget, matchesShortcut, type Shortcut } from "@shared/core";

/** Runs `handler` when `shortcut` is pressed anywhere in the window (but not while typing). */
export function useHotkey(shortcut: Shortcut, handler: () => void): void {
  const handlerRef = useRef(handler);
  const shortcutRef = useRef(shortcut);

  useEffect(() => {
    handlerRef.current = handler;
    shortcutRef.current = shortcut;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTypingTarget(event.target)) return;
      if (!matchesShortcut(event, shortcutRef.current)) return;
      event.preventDefault();
      handlerRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
