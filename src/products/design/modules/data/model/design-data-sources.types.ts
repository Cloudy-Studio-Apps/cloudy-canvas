import type { SettingValue } from "../source";
import type { DataShape } from "../table";

/** What a new source is made from; `settings` may hold secret values, which stay on the device. */
export interface DataSourceInit {
  sourceType: string;
  settings: Record<string, SettingValue>;
  secrets?: Record<string, string>;
  format?: string;
  formatOptions?: Record<string, SettingValue>;
  /** Where the rows are in the data; left out, the first list found. */
  rowsPath?: string | null;
  name?: string;
}

/** A shape step to set: the shape (`null`: none), or made from the one the source has then. */
export type ShapeChange = DataShape | null | ((current: DataShape | null) => DataShape | null);
