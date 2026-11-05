import type { DataSourceType } from "../data.points.types";
import type { SettingValue } from "../source";

/** What reading a source's data takes: its type and settings, the secrets and paths to use. */
export interface ReadDataInput {
  type: DataSourceType;
  settings: Record<string, SettingValue>;
  secrets: Record<string, string>;
  files: Record<string, string>;
  format: string;
  formatOptions: Record<string, SettingValue>;
  /** The source's "Rows come from" path, which a type that pages reads each page with. */
  rowsPath: string | null;
  /** Try it asks, so a type that pages gets only the first page. */
  preview?: boolean;
}
