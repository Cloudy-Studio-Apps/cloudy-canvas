import type { CanvasDocument } from "@canvas";

import {
  dataPhase,
  type DataLocaleProvider,
  type DataScope,
  type DataScopeProvider,
} from "../../../data";
import { brochuresOf } from "../design-brochures";
import { brochureLanguage } from "../language";
import { expandBrochure } from "./expand-brochure";
import { hasRepeats } from "./has-repeats";
import { slotKey } from "./slot-key";
import type { FramesAround } from "./page-scope-provider.types";

/** Each pass's answers, by its root scope (one object per sync pass, so a pass reads them once). */
const byRoot = new WeakMap<DataScope, FramesAround>();
/** The answers of the last pass that asked, per document, for the language provider. */
const latest = new WeakMap<CanvasDocument, FramesAround>();

/**
 * Every brochure page frame's loops (its `ExpandedPage.layers`) and language, over `root`: each
 * brochure with repeats is expanded once per root. A copy kept while its list can't be read
 * here reads its template's loops, unreadable, so its layers are left alone.
 */
function framesAround(doc: CanvasDocument, root: DataScope): FramesAround {
  const known = byRoot.get(root);
  if (known) {
    latest.set(doc, known);
    return known;
  }
  const out: FramesAround = { layers: new Map(), locales: new Map() };
  const phase = dataPhase(doc);
  for (const record of brochuresOf(doc).records()) {
    const locale = brochureLanguage(record.settings);
    for (const slot of record.slots) {
      for (const id of slot.frames) if (!out.locales.has(id)) out.locales.set(id, locale);
    }
    if (!hasRepeats(record)) continue;
    const { pages } = expandBrochure(record, root, phase);
    const byKey = new Map(pages.map((page) => [page.id, page]));
    for (const slot of record.slots) {
      const page =
        byKey.get(slotKey(slot)) ??
        (slot.generated
          ? pages.find(
              (item) =>
                item.from === slot.generated?.from && item.layers.some((layer) => layer.unreadable),
            )
          : undefined);
      if (!page || page.layers.length === 0) continue;
      for (const id of slot.frames) if (!out.layers.has(id)) out.layers.set(id, page.layers);
    }
  }
  byRoot.set(root, out);
  latest.set(doc, out);
  return out;
}

/**
 * The catalog's `dataScopeProviders` entry: a brochure page frame, a template page or a copy a
 * repeat made, reads the rows of the loops around it (its `ExpandedPage.layers`). The brochures
 * are expanded once per `root` (memoized on it: `root` is one object per sync pass), not once
 * per frame asked.
 */
export const pageScopeProvider: DataScopeProvider = (doc, frame, root) =>
  framesAround(doc, root).layers.get(frame.id) ?? null;

/**
 * The catalog's `dataLocaleProviders` entry: data on a brochure's page is written in the
 * brochure's language. Read from the answers of the pass that asked for the page's loops (the
 * scope is always asked first), so it costs nothing more.
 */
export const pageLocaleProvider: DataLocaleProvider = (doc, node) =>
  latest.get(doc)?.locales.get(node.id) ?? null;
