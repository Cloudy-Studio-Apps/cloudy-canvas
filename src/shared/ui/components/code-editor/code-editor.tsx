import { useEffect, useRef } from "react";
import { autocompletion } from "@codemirror/autocomplete";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { cn } from "@shared/ui/lib/utils";
import { editorBasics } from "./editor-basics";
import type { CodeEditorProps } from "./code-editor.types";
import { errorLine, setErrorLine } from "./error-line";
import { highlightEffects, rangeHighlight } from "./range-highlight";

/**
 * A code editor (CodeMirror) with line numbers, syntax colors, bracket matching, an error line
 * and a highlighted range, or a read-only viewer with `readOnly`. Controlled through `value`; only the user's edits come back in
 * `onChange`. Text set from outside starts a fresh editor state, so undo never reaches text the
 * user didn't type.
 */
export function CodeEditor({
  value,
  onChange,
  onFocus,
  onBlur,
  language,
  completions,
  label,
  invalid = false,
  errorLine: errorLineNumber = null,
  highlight = null,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const callbacks = useRef({ onChange, onFocus, onBlur, completions });
  const config = useRef({ language, label, invalid, readOnly });
  const slots = useRef({
    language: new Compartment(),
    label: new Compartment(),
    invalid: new Compartment(),
  });

  useEffect(() => {
    callbacks.current = { onChange, onFocus, onBlur, completions };
    config.current = { language, label, invalid, readOnly };
  });

  const createState = (doc: string): EditorState => {
    const { language, label, invalid, readOnly } = config.current;
    return EditorState.create({
      doc,
      extensions: [
        editorBasics,
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        slots.current.language.of(language),
        slots.current.label.of(labelAttributes(label)),
        slots.current.invalid.of(invalidAttributes(invalid)),
        errorLine,
        rangeHighlight,
        autocompletion({
          override: [(context) => callbacks.current.completions?.(context) ?? null],
          icons: false,
        }),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          const pasted = update.transactions.some((tr) => tr.isUserEvent("input.paste"));
          callbacks.current.onChange(update.state.doc.toString(), { pasted });
        }),
        EditorView.domEventHandlers({
          focus: () => {
            callbacks.current.onFocus?.();
          },
          blur: () => {
            callbacks.current.onBlur?.();
          },
        }),
      ],
    });
  };

  // Created once; later props reach the view through the effects below.
  useEffect(() => {
    if (!host.current) return;
    const created = new EditorView({ parent: host.current, state: createState(value) });
    view.current = created;
    return () => {
      created.destroy();
      view.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const current = view.current;
    if (!current || current.state.doc.toString() === value) return;
    // setState doesn't notify the update listener, so this isn't reported as an edit.
    current.setState(createState(value));
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: slots.current.language.reconfigure(language) });
  }, [language]);

  useEffect(() => {
    view.current?.dispatch({ effects: slots.current.label.reconfigure(labelAttributes(label)) });
  }, [label]);

  useEffect(() => {
    view.current?.dispatch({
      effects: slots.current.invalid.reconfigure(invalidAttributes(invalid)),
    });
  }, [invalid]);

  useEffect(() => {
    view.current?.dispatch({ effects: setErrorLine.of(errorLineNumber) });
  }, [errorLineNumber, value]);

  const from = highlight?.from;
  const to = highlight?.to;
  useEffect(() => {
    const current = view.current;
    if (!current) return;
    const range = from === undefined || to === undefined ? null : { from, to };
    current.dispatch({ effects: highlightEffects(current.state, range) });
  }, [from, to, value]);

  return (
    <div
      ref={host}
      className={cn(
        "flex min-h-0 flex-1 flex-col [&>.cm-editor]:min-h-0 [&>.cm-editor]:flex-1",
        className,
      )}
    />
  );
}

function labelAttributes(label: string) {
  return EditorView.contentAttributes.of({ "aria-label": label, spellcheck: "false" });
}

function invalidAttributes(invalid: boolean) {
  return invalid ? EditorView.editorAttributes.of({ class: "cm-invalid" }) : [];
}
