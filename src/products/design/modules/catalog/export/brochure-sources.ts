import type { CanvasDocument } from "@canvas";

import {
  dataSourcesIn,
  documentScopes,
  sourceOf,
  sourcesRead,
  type DataSourceElement,
} from "../../data";
import type { BrochureElement } from "../brochure";
import { brochureFrames } from "./brochure-frames";

/**
 * The sources a brochure reads, in the Data tab's order: the lists its repeating sections and pages
 * go through (a row name of a loop around one reads its own list's source, already counted) and
 * what the layers of its pages and masters read (`sourcesRead`). What an export asks to update.
 */
export function brochureSources(doc: CanvasDocument, record: BrochureElement): DataSourceElement[] {
  const sources = dataSourcesIn(doc);
  if (sources.length === 0) return [];
  const read = sourcesRead(doc, brochureFrames(record));
  const repeats = [...record.sections, ...record.slots].flatMap((item) =>
    item.repeat ? [item.repeat.source] : [],
  );
  if (repeats.length > 0) {
    const { root } = documentScopes(doc);
    for (const expr of repeats) {
      const id = sourceOf(root, expr);
      if (id) read.add(id);
    }
  }
  return sources.filter((source) => read.has(source.id));
}
