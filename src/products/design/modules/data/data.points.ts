import { definePoint } from "@shared/core";

import type { DataFormat, DataSourceType } from "./data.points.types";

/** Where data comes from, keyed by id: the built-ins, and any a plugin adds. */
export const dataSourceTypes = definePoint<DataSourceType>("design.data.sourceTypes", {
  keyOf: (t) => t.id,
});

/** How raw data becomes rows, keyed by id: the built-ins, and any a plugin adds. */
export const dataFormats = definePoint<DataFormat>("design.data.formats", {
  keyOf: (f) => f.id,
});
