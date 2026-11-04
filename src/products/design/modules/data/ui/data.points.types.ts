import type { ComponentType } from "react";

import type { DataSourceType } from "../data.points.types";
import type { SettingValue } from "../source";
import type { PreviewResult } from "../update";

/** What a source type's own settings form gets (instead of the generic one). */
export interface SourceFormProps {
  sourceType: DataSourceType;
  /** The settings as the form edits them; a secret the device holds is `""` (or left out). */
  values: Record<string, SettingValue>;
  /** The secrets (`key`, `key.name`) this device holds for the source: show them as saved. */
  stored: ReadonlySet<string>;
  /**
   * The settings changed: a secret left `""` keeps the stored value, `null` deletes it (see the
   * module's README).
   */
  onChange(values: Record<string, SettingValue>, options?: SourceFormChangeOptions): void;
  /** A file was chosen, by its name: the tab proposes the format from its extension. */
  onFilePicked?(name: string): void;
  /**
   * Try it: runs these settings once (not saved) with where the rows are, and gives what came
   * back. Left out where the tab can't run one.
   */
  onPreview?(
    values: Record<string, SettingValue>,
    rowsPath: string | null,
    signal: AbortSignal,
  ): Promise<PreviewResult>;
  /** Where the rows are in the data (`null`: the first list found). */
  rowsPath?: string | null;
  /** Another list was picked as the rows (in Try it). */
  onRowsPathChange?(rowsPath: string | null): void;
}

/** How a form's change is saved. */
export interface SourceFormChangeOptions {
  /** Update the source right after saving (a form's "Save and update"). */
  update?: boolean;
}

/** A source type's own settings form, keyed by the source type's id. */
export interface DataSourceFormEntry {
  type: string;
  component: ComponentType<SourceFormProps>;
}
