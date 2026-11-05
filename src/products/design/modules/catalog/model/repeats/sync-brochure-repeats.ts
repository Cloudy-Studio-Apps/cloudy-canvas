import type { CanvasDocument, EditedChange, ElementKinds } from "@canvas";

import {
  childrenMap,
  dataPhase,
  DATA_SOURCE_TYPE,
  documentScopes,
  syncDataFor,
  type DataScope,
} from "../../../data";
import { isBrochure, type BrochureElement } from "../../brochure";
import { arrangeBrochure, arrangedPages } from "../arrange";
import { bookLayout } from "../book-layout";
import { brochurePages } from "../brochure-pages";
import { brochuresOf } from "../design-brochures";
import { expandBrochure } from "./expand-brochure";
import { hasRepeats } from "./has-repeats";
import { planBrochureRepeats } from "./plan-brochure-repeats";
import { repeatSignature } from "./repeat-signature";
import { touchedTops } from "./touched-tops";
import { emptyRepeatsPlan, writeBrochureRepeats } from "./write-brochure-repeats";

/** Whether an edit changed the data any repeat reads: a source added, changed or removed. */
function sourcesChanged(doc: CanvasDocument, change: EditedChange): boolean {
  if (change.removed.some((el) => el.type === DATA_SOURCE_TYPE)) return true;
  for (const id of change.updated) if (doc.field(id, "type") === DATA_SOURCE_TYPE) return true;
  return false;
}

/** Whether the edit changed what the loops around the brochure's pages read (or made it). */
function loopsChanged(record: BrochureElement, change: EditedChange): boolean {
  if (!change.updated.has(record.id)) return false;
  const before = change.before.get(record.id);
  if (!before) return true;
  return repeatSignature({ ...record, ...before } as BrochureElement) !== repeatSignature(record);
}

/**
 * The catalog's `afterEdit` hook that makes a brochure's repeats' copies, in the edit's undo
 * step and before the page items (so masters are stamped on new pages): for each brochure with
 * repeats (or copies left) whose record, template pages or sources the edit changed, it expands
 * the brochure once (`expandBrochure` in the document's data phase) and writes what differs from
 * its generated pages and slots (`planBrochureRepeats`, `writeBrochureRepeats`), so its own
 * writes, which run it again, end it. The brochure is arranged again when pages came or moved and
 * its `arrange` is on. Then the pages it made or changed, and every page of a brochure whose loops
 * changed (a list, a preview row, its language), are filled from their rows (`syncDataFor`).
 */
export function syncBrochureRepeats(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
): void {
  const records = brochuresOf(doc)
    .records()
    .filter(
      (record) =>
        hasRepeats(record) ||
        record.slots.some((slot) => slot.generated) ||
        change.updated.has(record.id),
    );
  if (records.length === 0) return;
  const sources = sourcesChanged(doc, change);
  const tops = sources ? new Set<string>() : touchedTops(doc, change);
  let root: DataScope | null = null;
  let children: ReturnType<typeof childrenMap> | null = null;

  for (const record of records) {
    const loops = loopsChanged(record, change);
    const affected =
      sources ||
      change.updated.has(record.id) ||
      record.slots.some((slot) => !slot.generated && slot.frames.some((id) => tops.has(id)));
    if (!affected) continue;
    root ??= documentScopes(doc).root;
    const expansion = expandBrochure(record, root, dataPhase(doc));
    const plan = planBrochureRepeats(doc, record, expansion, (children ??= childrenMap(doc)));
    const empty = emptyRepeatsPlan(plan);
    const touched = empty ? [] : writeBrochureRepeats(doc, record, plan);
    if (!empty) children = null;
    const after = doc.get(record.id);
    if (!after || !isBrochure(after)) continue;
    const added = plan.pages.some((page) => page.add[0]?.parentId === null);
    if (after.settings.arrange !== "off" && (added || plan.slots)) {
      const pages = arrangedPages(brochurePages(doc, after, expansion));
      arrangeBrochure(doc, after, bookLayout(pages, after.settings), pages, after.settings.arrange);
    }
    const fill = new Set(touched);
    if (loops) for (const slot of after.slots) for (const id of slot.frames) fill.add(id);
    if (fill.size > 0) syncDataFor(doc, [...fill], kinds);
  }
}
