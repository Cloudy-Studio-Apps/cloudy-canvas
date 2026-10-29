import type { CodeOptionValue } from "../targets";

/** The target, version and options last exported with (kept while the app is open). */
export interface CodeExportChoice {
  target: string;
  profile: string;
  options: Readonly<Record<string, CodeOptionValue>>;
}

export interface CodeExportState {
  /** The table and enum ids the dialog is open for (`[]`: the whole schema), or `null` closed. */
  ids: string[] | null;
  open: (ids: string[]) => void;
  close: () => void;
  last: CodeExportChoice | null;
  remember: (choice: CodeExportChoice) => void;
}
