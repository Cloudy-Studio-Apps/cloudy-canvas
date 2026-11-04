import type { DataSourceDefaults } from "./data-source.types";

export const DATA_SOURCE_DEFAULTS = {
  name: "Data source",
  format: "auto",
  formatOptions: {},
  fields: [],
  snapshot: null,
  images: {},
} satisfies DataSourceDefaults;
