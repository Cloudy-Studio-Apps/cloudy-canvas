import type { ComponentType } from "react";

import type { DataSourceType } from "../data.points.types";
import type { SettingValue } from "../source";

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
  onChange(values: Record<string, SettingValue>): void;
  /** A file was chosen, by its name: the tab proposes the format from its extension. */
  onFilePicked?(name: string): void;
}

/** A source type's own settings form, keyed by the source type's id. */
export interface DataSourceFormEntry {
  type: string;
  component: ComponentType<SourceFormProps>;
}
