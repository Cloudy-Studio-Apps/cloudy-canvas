import { useEffect } from "react";

import { randomizePalette, redoPalette, undoPalette } from "../store";

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** Space generates a random palette; Ctrl+Z / Ctrl+Shift+Z undo and redo the palette. */
export function useRandomShortcut(): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (typing(event.target)) return;
      const mod = event.ctrlKey || event.metaKey;
      if (event.key === " " && !mod) randomizePalette();
      else if (mod && event.key.toLowerCase() === "z")
        (event.shiftKey ? redoPalette : undoPalette)();
      else if (mod && event.key.toLowerCase() === "y") redoPalette();
      else return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
}
