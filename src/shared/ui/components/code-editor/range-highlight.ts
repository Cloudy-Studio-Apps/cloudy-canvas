import { StateEffect, StateField } from "@codemirror/state";
import type { EditorState } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";

import type { CodeRange } from "./code-editor.types";

/** Sets the range whose lines are banded, or null to clear it. */
export const setHighlight = StateEffect.define<CodeRange | null>();

const lineMark = Decoration.line({ class: "cm-highlight-line" });

function bandLines(state: EditorState, range: CodeRange): DecorationSet {
  const end = Math.min(Math.max(range.from, range.to - 1), state.doc.length);
  const first = state.doc.lineAt(Math.min(range.from, state.doc.length)).number;
  const last = state.doc.lineAt(end).number;
  const marks = [];
  for (let n = first; n <= last; n++) marks.push(lineMark.range(state.doc.line(n).from));
  return Decoration.set(marks);
}

/** A band over the lines of a range, like the selected shape's block. */
export const rangeHighlight = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(marks, tr) {
    let next = marks.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlight)) {
        next = effect.value ? bandLines(tr.state, effect.value) : Decoration.none;
      }
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

/** The effects that band `range` and scroll it into view. */
export function highlightEffects(state: EditorState, range: CodeRange | null) {
  if (!range) return [setHighlight.of(null)];
  const from = Math.min(range.from, state.doc.length);
  return [setHighlight.of(range), EditorView.scrollIntoView(from, { y: "nearest", yMargin: 24 })];
}
