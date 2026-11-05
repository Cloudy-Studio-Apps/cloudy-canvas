import type { CanvasElement, ElementDefaults } from "@canvas";

import type { DataExtraValue, DataList } from "../table/find-lists.types";
import type { DataShape } from "../table/shape.types";

/** A setting of a source type or format: text, a number, a switch, a map (headers) or unset. */
export type SettingValue = string | number | boolean | Record<string, string> | null;

/** What a field holds, which decides how it is shown and what it can fill. */
export type FieldType =
  | "text"
  | "integer"
  | "number"
  | "currency"
  | "boolean"
  | "date"
  | "color"
  | "url"
  | "image-url"
  | "image-base64"
  | "image-file"
  | "list"
  | "object";

/** How a field's value is written when it fills a layer. */
export interface FieldFormat {
  decimals?: number;
  currency?: string;
  dateStyle?: "short" | "medium" | "long";
  prefix?: string;
  suffix?: string;
  trueText?: string;
  falseText?: string;
  /** How a list shows: every item with commas (`"all"`, the default), the first, or how many. */
  list?: ListShow;
}

/** How a list's items show in a text. */
export type ListShow = "all" | "first" | "count";

/** One field of the data: where it is (`path`), what it is called and how it is read. */
export interface DataField {
  path: string;
  alias?: string;
  type: FieldType;
  format?: FieldFormat;
  hidden?: boolean;
}

/** The last data fetched, kept in the file as an asset so it works offline. */
export interface DataSnapshot {
  assetId: string;
  updatedAt: number;
  rowCount: number;
  hash: string;
  /**
   * The snapshot this one replaced, while the data last changed: kept in the file with it, so
   * undoing that Update (a peer's too) still finds its rows (see `pruneSnapshots`).
   */
  previous?: string;
  /** The lists of objects the data had that could be its rows (`findLists`), for the picker. */
  lists?: DataList[];
  /** The plain values at the top of the data, beside its rows (`total: 194`). */
  extras?: Record<string, DataExtraValue>;
}

/**
 * A data source: where some data comes from, how it is read and the last copy of it. A record,
 * not a layer. Errors are not kept here: they belong to the device.
 */
export interface DataSourceElement extends CanvasElement {
  type: "data-source";
  name: string;
  sourceType: string;
  settings: Record<string, SettingValue>;
  /** `"auto"` or a format id. */
  format: string;
  formatOptions: Record<string, SettingValue>;
  /**
   * Where the rows are in the data (`products`, `data.items`; `""` the data itself), or `null`:
   * the first list found.
   */
  rowsPath: string | null;
  /**
   * The optional step that renames and picks fields once the rows are found (`shapeRows`), or
   * `null`: the rows as they are.
   */
  shape: DataShape | null;
  fields: DataField[];
  snapshot: DataSnapshot | null;
  /** Image assets the data points at, by the value that names them. */
  images: Record<string, string>;
}

/** What a new source starts with. */
export interface DataSourceDefaults extends ElementDefaults {
  name: string;
  format: string;
  formatOptions: Record<string, SettingValue>;
  rowsPath: string | null;
  shape: DataShape | null;
  fields: DataField[];
  snapshot: DataSnapshot | null;
  images: Record<string, string>;
}
