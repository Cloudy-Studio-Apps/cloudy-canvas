import type {
  CanvasDocument,
  CanvasElement,
  EditedChange,
  ElementKinds,
  ElementPatch,
} from "@canvas";
import { getLocale } from "@shared/core";

import { rootScope } from "../bindings";
import type { BindingContext } from "../bindings";
import { dataCopyTag, dataScopes, repeatOf } from "../repeat";
import { dataSourcesIn, type DataSourceElement } from "../source";
import { imageKey, readSnapshot } from "../update";
import { affectedData } from "./affected-data";
import { planLayer } from "./plan-layer";
import { sweepOrphans } from "./sweep-orphans";
import { syncIterators } from "./sync-iterators";

/**
 * Each source's saved pictures by `imageKey`, apart: a file name is relative to its own source's
 * folder, so two sources' `logo.png` are different pictures. A picture this device lacks the
 * asset of reads as not saved: the layer keeps its current one.
 */
function picturesBySource(
  doc: CanvasDocument,
  sources: readonly DataSourceElement[],
): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  for (const source of sources) {
    const own = new Map<string, string>();
    for (const [key, assetId] of Object.entries(source.images)) {
      if (doc.hasAsset(assetId)) own.set(key, assetId);
    }
    out.set(source.id, own);
  }
  return out;
}

/**
 * The data module's `afterEdit` hook, in the edit's undo step: fills the layers the edit asks
 * for (`affectedData`: every bound layer when a source's data changed, else the changed bound
 * layers) from the sources' rows, writing only what differs, so its own writes, which run it
 * again, end it. First the layers edited (`planLayer`, with the hand-edit rules), each in its
 * own scope (`dataScopes`: the rows of the iterators around it); copies are left to their
 * iterator. Then the iterators the edit reached (`syncIterators`, outermost first) bring their
 * copies in step and fill them. The root scope (each source by name) and each iterator's rows
 * are built once per run.
 */
export function syncData(doc: CanvasDocument, change: EditedChange, kinds: ElementKinds): void {
  // Copies that lost their iterator become ordinary layers.
  sweepOrphans(doc, change);
  const affected = affectedData(doc, change);
  if (!affected.all && affected.nodes.length === 0 && affected.iterators.length === 0) return;

  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const root = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const scopes = dataScopes(doc, root);
  const pictures = picturesBySource(doc, sources);
  const ctx: BindingContext = {
    kinds,
    locale: getLocale(),
    images: (value, sourceId) => pictures.get(sourceId)?.get(imageKey(value)) ?? null,
  };

  const patches = new Map<string, ElementPatch>();
  const iterators = affected.all ? [] : [...affected.iterators];
  const plan = (el: CanvasElement) => {
    if (affected.all && repeatOf(el)) iterators.push(el.id);
    // A copy is its iterator's to fill, with no hand-edit rules: it follows its template.
    if (dataCopyTag(el)) return;
    const edited = change.before.get(el.id);
    const patch = planLayer(el, edited, affected.all, scopes.scopeFor(el), ctx);
    if (patch) patches.set(el.id, patch);
  };
  if (affected.all) for (const el of doc.all()) plan(el);
  else {
    for (const id of affected.nodes) {
      const el = doc.get(id);
      if (el) plan(el);
    }
  }
  if (patches.size > 0) doc.updateMany(patches);
  if (iterators.length > 0) syncIterators(doc, iterators, scopes, ctx);
}
