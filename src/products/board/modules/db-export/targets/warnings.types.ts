/** What a warning is about; each has a `warnings.<id>` string in the module's locales. */
export type CodeWarningId =
  | "missing-table"
  | "unknown-type"
  | "reserved-word"
  | "name-collision"
  | "no-primary-key"
  | "composite-key"
  | "fk-cycle"
  | "many-to-many"
  | "unsupported-default"
  | "unsupported-increment"
  | "unsupported-reference"
  | "unsupported-index";

/** Something the export couldn't write as the schema says. Its text is `warningText`. */
export interface CodeWarning {
  id: CodeWarningId;
  params: Readonly<Record<string, string>>;
  table?: string;
  column?: string;
}
