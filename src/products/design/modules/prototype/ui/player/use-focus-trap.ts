import { useEffect } from "react";

/** What Tab stops at. */
const FOCUSABLE =
  "button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])";

/**
 * Keeps the focus inside `root` while it's mounted (a modal over the editor): it takes the focus,
 * Tab and Shift+Tab go round its controls, focus that lands elsewhere comes back (lists its
 * controls open in a portal, such as a select's, are allowed), and the focus goes back to where it
 * was when it unmounts. So Enter or Space never reach an editor button behind it.
 */
export function useFocusTrap(root: HTMLElement | null): void {
  useEffect(() => {
    if (!root) return;
    const before = document.activeElement;
    root.focus();
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof Node && root.contains(target)) return;
      if (target instanceof Element && target.closest("[role='listbox']")) return;
      root.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items.at(-1);
      const active = document.activeElement;
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("focusin", onFocusIn);
    root.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("keydown", onKeyDown);
      if (before instanceof HTMLElement && before.isConnected) before.focus();
    };
  }, [root]);
}
