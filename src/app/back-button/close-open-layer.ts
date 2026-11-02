/** What floats over a page and closes with Esc: dialogs, menus and popovers. */
const OPEN_LAYERS =
  "[role='dialog'], [role='alertdialog'], [role='menu'], [data-radix-popper-content-wrapper]";

/** Closes what's open on top, as Esc does. Returns whether there was anything. */
export function closeOpenLayer(): boolean {
  if (!document.querySelector(OPEN_LAYERS)) return false;
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return true;
}
