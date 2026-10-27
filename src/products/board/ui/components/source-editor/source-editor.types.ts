import type { CompletionSource } from "@codemirror/autocomplete";
import type { Extension } from "@codemirror/state";

import type { DbmlError } from "@board";
import type { CodeRange } from "@shared/ui/components/code-editor";

export type SourceApplyResult =
  { ok: true; warnings: DbmlError[] } | { ok: false; error: DbmlError };

export interface SourceEditorProps {
  /** Changes whenever the document content the text describes changes. */
  version: number;
  /** Current text generated from the document. */
  read: () => string;
  /**
   * Parses and writes the text to the document. `commit` is true for pasted text and on blur,
   * when the text is taken as finished rather than half-typed.
   */
  apply: (text: string, commit: boolean) => SourceApplyResult;
  label: string;
  hint: string;
  /** Part of the text to point out (e.g. the selected shape's block): scrolled to and highlighted. */
  highlight?: SourceRange | null;
  /** Syntax colors, from `createSourceLanguage` (the db and er modules have theirs). */
  language: Extension;
  /** Suggestions while typing (`dbmlCompletions`, `erCompletions`). */
  completions?: CompletionSource;
}

/** A span of the text, as character offsets (`to` is exclusive). */
export type SourceRange = CodeRange;

export type SourceStatus = { error: DbmlError } | { warnings: string[] };
