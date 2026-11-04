import { definePoint } from "@shared/core";

import type { PageItemEntry } from "./catalog.points.types";

/**
 * The page items the Catalog's Page items list offers (page number, title, …), keyed by id:
 * the built-ins, and any a plugin adds.
 */
export const catalogPageItems = definePoint<PageItemEntry>("catalog.pageItems", {
  keyOf: (item) => item.id,
});
