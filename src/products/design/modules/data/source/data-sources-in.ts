import type { CanvasDocument } from "@canvas";

import { DATA_SOURCE_TYPE } from "./data-source.constants";
import type { DataSourceElement } from "./data-source.types";
import { isDataSource } from "./is-data-source";

/** Every data source record of a document, in order. */
export function dataSourcesIn(doc: CanvasDocument): DataSourceElement[] {
  const records: DataSourceElement[] = [];
  for (const id of doc.ids()) {
    if (doc.field(id, "type") !== DATA_SOURCE_TYPE) continue;
    const el = doc.get(id);
    if (el && isDataSource(el)) records.push(el);
  }
  return records.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
}
