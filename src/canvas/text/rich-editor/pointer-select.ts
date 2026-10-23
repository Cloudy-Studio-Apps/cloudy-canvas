import { Disposables } from "../../utils";
import { wordRange } from "../rich/rich-caret";
import type { PointerSelectHost } from "./pointer-select.types";
import { anchorOf, paragraphRange, selectBetween } from "./textarea-selection";

/**
 * Selects with a press on the edited text, as text fields do: a click puts the caret, Shift
 * extends the selection, a drag selects, a double click a word and a triple click a paragraph.
 */
export function pointerSelect(event: PointerEvent, host: PointerSelectHost): void {
  const { textarea, root } = host;
  const index = host.indexAt(event);
  if (index === null) return;
  if (event.detail >= 2) {
    const range =
      event.detail === 2 ? wordRange(host.text, index) : paragraphRange(host.text, index);
    textarea.setSelectionRange(range.start, range.end);
    host.changed();
    return;
  }
  const anchor = event.shiftKey ? anchorOf(textarea) : index;
  const select = (to: number) => {
    selectBetween(textarea, anchor, to);
    host.changed();
  };
  select(index);
  root.setPointerCapture(event.pointerId);
  const drag = new Disposables();
  drag.listen(root, "pointermove", (move) => {
    const to = host.indexAt(move);
    if (to !== null) select(to);
  });
  const stop = () => drag.dispose();
  drag.listen(root, "pointerup", stop);
  drag.listen(root, "pointercancel", stop);
  host.listeners.add(stop);
}
