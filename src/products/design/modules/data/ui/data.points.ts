import { definePoint } from "@shared/core";

import type { DataSourceFormEntry } from "./data.points.types";

/**
 * Settings forms of source types that want their own (a sheet picker, a sign-in), keyed by the
 * source type's id. A type without one gets the generic form built from its `settings`.
 */
export const dataSourceForms = definePoint<DataSourceFormEntry>("design.data.sourceForms", {
  keyOf: (entry) => entry.type,
});
