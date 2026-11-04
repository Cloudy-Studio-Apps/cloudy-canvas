import type { DataField, SettingValue } from "../source";
import type { DataExtraValue, DataList, DataRow } from "../table";

/** What Try it runs: a source's settings as a form holds them, not saved yet. */
export interface PreviewInput {
  sourceType: string;
  /**
   * The form's values: secrets typed now are used (and never saved); a secret left `""` is the
   * one this device keeps for `sourceId`, when its origin still matches.
   */
  settings: Record<string, SettingValue>;
  /** The source being edited, for its stored secrets and file paths; none for a new one. */
  sourceId?: string;
  format: string;
  formatOptions: Record<string, SettingValue>;
  /** Where the rows are (`null`: the first list found). */
  rowsPath: string | null;
  /** The fields already known, so their settings carry into the preview. */
  fields?: DataField[];
}

/** What Try it found, or why it couldn't. */
export type PreviewResult =
  | {
      ok: true;
      /** The first rows (at most 50). */
      rows: DataRow[];
      rowCount: number;
      fields: DataField[];
      lists: DataList[];
      extras: Record<string, DataExtraValue>;
    }
  | { ok: false; error: string; aborted?: boolean };
