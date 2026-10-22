import { RangeSet, StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView, GutterMarker, gutterLineClass } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";

/** Sets the 1-based line to mark as wrong, or null to clear it. */
export const setErrorLine = StateEffect.define<number | null>();

const lineMark = Decoration.line({ class: "cm-error-line" });

class ErrorGutterMarker extends GutterMarker {
  override elementClass = "cm-error-gutter";
}
const gutterMark = new ErrorGutterMarker();

/** The marked line, kept in place while the text changes and cleared by `setErrorLine(null)`. */
export const errorLine = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(marks, tr) {
    let next = marks.map(tr.changes);
    for (const effect of tr.effects) {
      if (!effect.is(setErrorLine)) continue;
      const line = effect.value;
      next =
        line !== null && line >= 1 && line <= tr.state.doc.lines
          ? Decoration.set(lineMark.range(tr.state.doc.line(line).from))
          : Decoration.none;
    }
    return next;
  },
  provide: (field) => [
    EditorView.decorations.from(field),
    gutterLineClass.compute([field], (state) => {
      const marks = state.field(field);
      const starts: number[] = [];
      marks.between(0, state.doc.length, (from) => {
        starts.push(from);
      });
      return RangeSet.of(starts.map((from) => gutterMark.range(from)));
    }),
  ],
});
