import type { CanvasDocument } from "@canvas";

import {
  dataPhase,
  dataSourcesIn,
  documentScopes,
  rootScope,
  type DataScope,
  type DataSourceElement,
} from "../../../data";
import type { BrochureElement } from "../../brochure";
import type { ExpansionMemo } from "./brochure-expansion.types";
import { expandBrochure } from "./expand-brochure";
import type { BrochureExpansion } from "./expand-brochure.types";
import { hasRepeats } from "./has-repeats";

/** No source at all: a brochure without repeats reads nothing (its section names stay as written). */
const NO_DATA: DataScope = rootScope([], () => null);

/** Each document's last expansion per brochure id. */
const memos = new WeakMap<CanvasDocument, Map<string, ExpansionMemo>>();

const heldKey = (doc: CanvasDocument, sources: readonly DataSourceElement[]) =>
  sources
    .map((source) => (source.snapshot && doc.hasAsset(source.snapshot.assetId) ? 1 : 0))
    .join("");

const same = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

/**
 * A brochure's pages and sections with its repeats expanded (`expandBrochure`) over the document's
 * sources, in the document's data phase (`dataPhase`: an export's scratch copy makes every page).
 * A brochure without repeats reads no data. Remembered per brochure until its record, a source,
 * the snapshots this device holds or the phase change, so every page row and panel reading it
 * after an edit share one expansion (the result is shared: never change it).
 */
export function brochureExpansion(doc: CanvasDocument, record: BrochureElement): BrochureExpansion {
  const phase = dataPhase(doc);
  const repeats = hasRepeats(record);
  const sources = repeats ? dataSourcesIn(doc) : [];
  const held = heldKey(doc, sources);
  let byId = memos.get(doc);
  if (!byId) memos.set(doc, (byId = new Map()));
  const memo = byId.get(record.id);
  if (
    memo &&
    memo.record === record &&
    memo.phase === phase &&
    memo.held === held &&
    same(memo.sources, sources)
  ) {
    return memo.expansion;
  }
  const root = repeats ? documentScopes(doc).root : NO_DATA;
  const expansion = expandBrochure(record, root, phase);
  byId.set(record.id, { record, phase, sources, held, expansion });
  return expansion;
}
