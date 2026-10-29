import type { CompletionSource } from "@codemirror/autocomplete";
import type { Extension } from "@codemirror/state";

/** A span of the text, as character offsets (`to` is exclusive). */
export interface CodeRange {
  from: number;
  to: number;
}

export interface CodeChange {
  /** The change came from pasting, not typing. */
  pasted: boolean;
}

export interface CodeEditorProps {
  value: string;
  /** Called for the user's edits only, never for `value` changes from outside. */
  onChange: (value: string, change: CodeChange) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Syntax colors, e.g. a `StreamLanguage`. */
  language: Extension;
  /** Suggestions while typing (Ctrl+Space asks for them); read on every request. */
  completions?: CompletionSource;
  label: string;
  invalid?: boolean;
  /** 1-based line to mark as wrong, or null. */
  errorLine?: number | null;
  /** Part of the text to point out: its lines are banded and scrolled into view. */
  highlight?: CodeRange | null;
  /** Shows the text without letting it be edited (set when the editor is created). */
  readOnly?: boolean;
  className?: string;
}
