/** Where the selection's free end is (the caret, when it's collapsed). */
export function focusOf(textarea: HTMLTextAreaElement): number {
  return textarea.selectionDirection === "backward"
    ? textarea.selectionStart
    : textarea.selectionEnd;
}

/** Where the selection's fixed end is. */
export function anchorOf(textarea: HTMLTextAreaElement): number {
  return textarea.selectionDirection === "backward"
    ? textarea.selectionEnd
    : textarea.selectionStart;
}

/** Selects from `anchor` to `focus`, in either direction. */
export function selectBetween(textarea: HTMLTextAreaElement, anchor: number, focus: number): void {
  if (focus < anchor) textarea.setSelectionRange(focus, anchor, "backward");
  else textarea.setSelectionRange(anchor, focus, "forward");
}

/** The paragraph (line break to line break) round `index`. */
export function paragraphRange(text: string, index: number): { start: number; end: number } {
  const start = index > 0 ? text.lastIndexOf("\n", index - 1) + 1 : 0;
  const next = text.indexOf("\n", index);
  return { start, end: next < 0 ? text.length : next };
}
