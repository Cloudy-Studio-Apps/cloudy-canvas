import type { CanvasElement, ElementDefaults } from "@canvas";

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
}

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
  fields: DataField[];
  snapshot: DataSnapshot | null;
  images: Record<string, string>;
}
