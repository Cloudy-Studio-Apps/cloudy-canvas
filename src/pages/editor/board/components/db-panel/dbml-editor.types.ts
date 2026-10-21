import type { DbApplyOptions, DbApplyResult } from "@engine";

export interface DbmlEditorProps {
  /** Current DBML generated from the document. */
  read: () => string;
  /** Parses and writes the text to the document. */
  apply: (text: string, options: DbApplyOptions) => DbApplyResult;
  label: string;
  hint: string;
}

export type DbmlStatus =
  Pick<Extract<DbApplyResult, { ok: false }>, "error"> | { warnings: string[] };
