import type { DbmlError } from "@engine";

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
}

/** A span of the text, as character offsets (`to` is exclusive). */
export interface SourceRange {
  from: number;
  to: number;
}

export type SourceStatus = { error: DbmlError } | { warnings: string[] };
