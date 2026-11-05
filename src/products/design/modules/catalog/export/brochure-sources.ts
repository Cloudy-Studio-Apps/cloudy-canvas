import type { CanvasDocument } from "@canvas";

import {
  dataSourcesIn,
  documentScopes,
  sourceReadBy,
  sourcesRead,
  type DataSourceElement,
} from "../../data";
import type { BrochureElement } from "../brochure";
import { brochureFrames } from "./brochure-frames";

/**
 * The sources a brochure reads, in the Data tab's order: the lists its repeating sections and pages
 * go through (a row name of a loop around one reads its own list's source, already counted) and
 * what the layers of its pages and masters read (`sourcesRead`), those whose data isn't on this
 * device included (`unreadableSources`). What an export asks to update.
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
    const byName = new Map(sources.map((source) => [source.name, source.id]));
    for (const expr of repeats) {
      const id = sourceReadBy(root, expr, byName);
      if (id) read.add(id);
    }
  }
  return sources.filter((source) => read.has(source.id));
}

/** Of `sources`, those whose data can't be read on this device (its snapshot missing or broken). */
export function unreadableSources(
  doc: CanvasDocument,
  sources: readonly DataSourceElement[],
): DataSourceElement[] {
  if (sources.length === 0) return [];
  const { unreadable } = documentScopes(doc).root;
  return sources.filter((source) => unreadable.has(source.name));
}
