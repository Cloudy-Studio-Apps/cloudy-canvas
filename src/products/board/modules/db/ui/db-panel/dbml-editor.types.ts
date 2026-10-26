import type { DbApplyOptions, DbApplyResult } from "../../schema/db-schema.types";

export interface DbmlEditorProps {
  /** Current DBML generated from the document. */
  read: () => string;
  /** Parses and writes the text to the document. */
  apply: (text: string, options: DbApplyOptions) => DbApplyResult;
  label: string;
  hint: string;
}
