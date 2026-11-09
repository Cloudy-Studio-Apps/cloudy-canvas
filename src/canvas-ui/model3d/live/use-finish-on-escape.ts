import { useEffect } from "react";

/** What has its own Esc (closing it): a dialog, a popover, a menu. */
const OVERLAYS = "[role='dialog'], [role='alertdialog'], [role='menu']";
/** Such an overlay open over the canvas (Radix marks them), whatever has the focus. */
const OPEN_OVERLAYS = OVERLAYS.split(", ")
  .map((role) => `${role}[data-state='open']`)
  .join(", ");

/**
 * Esc finishes the live edit, and only that: it's caught before the canvas and its mode see it.
 * Typing in a field (a panel's) keeps its keys, and a dialog, popover or menu that is open or has
 * the focus closes with it instead.
 */
export function useFinishOnEscape(onFinish: () => void): void {
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(`input, textarea, [contenteditable='true'], ${OVERLAYS}`)) return;
      if (document.querySelector(OPEN_OVERLAYS)) return;
      event.preventDefault();
      event.stopPropagation();
      onFinish();
    };
    window.addEventListener("keydown", keyDown, { capture: true });
    return () => window.removeEventListener("keydown", keyDown, { capture: true });
  }, [onFinish]);
}
