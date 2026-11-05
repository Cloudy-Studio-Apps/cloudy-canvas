import type { DataSourceDefaults } from "./data-source.types";

export const DATA_SOURCE_DEFAULTS = {
  name: "Data source",
  format: "auto",
  formatOptions: {},
  rowsPath: null,
  shape: null,
  fields: [],
  snapshot: null,
  images: {},
} satisfies DataSourceDefaults;
