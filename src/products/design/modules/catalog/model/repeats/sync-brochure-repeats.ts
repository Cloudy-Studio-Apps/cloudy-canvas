import type { CanvasDocument, EditedChange, ElementKinds } from "@canvas";

import {
  childrenMap,
  DATA_SOURCE_TYPE,
  documentScopes,
  syncDataFor,
  type DataScope,
} from "../../../data";
import { brochurePhase } from "./brochure-phase";
import { isBrochure, type BrochureElement } from "../../brochure";
import { arrangeBrochure, arrangedPages } from "../arrange";
import { brochureCopies } from "./brochure-copies";
import { bookLayout } from "../book-layout";
import { brochurePages } from "../brochure-pages";
import { brochuresOf } from "../design-brochures";
import { expandBrochure } from "./expand-brochure";
import { hasRepeats } from "./has-repeats";
import { planBrochureRepeats } from "./plan-brochure-repeats";
import { repeatSignature } from "./repeat-signature";
import { templateSlots } from "./repeat-tree";
import { touchedTops } from "./touched-tops";
import { emptyRepeatsPlan, writeBrochureRepeats } from "./write-brochure-repeats";

/** Whether an edit changed the data any repeat reads: a source added, changed or removed. */
function sourcesChanged(doc: CanvasDocument, change: EditedChange): boolean {
  if (change.removed.some((el) => el.type === DATA_SOURCE_TYPE)) return true;
  for (const id of change.updated) if (doc.field(id, "type") === DATA_SOURCE_TYPE) return true;
  return false;
}

/**
 * What the edit did to a brochure's record: whether it repeats (now or before the edit, or has
 * copies left, listed or, on a record edit, not), and whether every page must be filled again: its loops changed (with repeats) or
 * its language did (data on its pages is written in it).
 */
function recordChange(
  doc: CanvasDocument,
  record: BrochureElement,
  change: EditedChange,
): { repeats: boolean; refill: boolean } {
  const edited = change.updated.has(record.id);
  const before = edited ? change.before.get(record.id) : undefined;
  const was = before ? ({ ...record, ...before } as BrochureElement) : record;
  // On a record edit, copy frames no slot lists count too (a concurrent edit that dropped the
  // repeat and its slots), so they're swept; the scan only runs then.
  const repeats =
    hasRepeats(record) ||
    hasRepeats(was) ||
    record.slots.some((slot) => slot.generated) ||
    (edited && brochureCopies(doc, record).length > 0);
  const language = was.settings.language !== record.settings.language;
  const loops = edited && (!before || repeatSignature(was) !== repeatSignature(record));
  return { repeats, refill: language || (repeats && loops) };
}

/**
 * The catalog's `afterEdit` hook that makes a brochure's repeats' copies, in the edit's undo
 * step and before the page items (so masters are stamped on new pages): for each brochure with
 * repeats (now or before the edit, or copies left) whose record, template pages or sources the
 * edit changed, it expands the brochure once (`expandBrochure` in the document's `brochurePhase`) and writes what differs from
 * its generated pages and slots (`planBrochureRepeats`, `writeBrochureRepeats`), so its own
 * writes, which run it again, end it. The brochure is arranged again when pages came or moved and
 * its `arrange` is on. Then the pages it made or changed, and every page of a brochure whose loops
 * changed (a list, a preview row) or whose language changed (any brochure's) are filled from their
 * rows (`syncDataFor`).
 */
export function syncBrochureRepeats(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
): void {
  const records = brochuresOf(doc).records();
  if (records.length === 0) return;
  const sources = sourcesChanged(doc, change);
  const tops = sources ? new Set<string>() : touchedTops(doc, change);
  let root: DataScope | null = null;
  let children: ReturnType<typeof childrenMap> | null = null;

  for (const record of records) {
    const { repeats, refill } = recordChange(doc, record, change);
    if (!repeats && !refill) continue;
    const affected =
      sources ||
      change.updated.has(record.id) ||
      templateSlots(record).some((slot) => slot.frames.some((id) => tops.has(id)));
    if (!affected) continue;
    root ??= documentScopes(doc).root;
    const expansion = expandBrochure(record, root, brochurePhase(doc));
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
    if (refill) for (const slot of after.slots) for (const id of slot.frames) fill.add(id);
    if (fill.size > 0) syncDataFor(doc, [...fill], kinds);
  }
}
