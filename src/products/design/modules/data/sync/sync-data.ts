import type {
  CanvasDocument,
  CanvasElement,
  EditedChange,
  ElementKinds,
  ElementPatch,
} from "@canvas";
import { getLocale } from "@shared/core";

import { isDesignNode, type DesignNode } from "../../core";
import { hasDataFields, rootScope } from "../bindings";
import type { BindingContext } from "../bindings";
import {
  childrenMap,
  dataCopyTag,
  dataScopes,
  followWrappedTemplate,
  repeatOf,
  walkDescendants,
} from "../repeat";
import { dataPhase } from "../model/data-phase";
import { dataSourcesIn, type DataSourceElement } from "../source";
import { imageKey, readSnapshot } from "../update";
import { affectedData } from "./affected-data";
import type { AffectedData } from "./affected-data.types";
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
 * own scope (`dataScopes`: the loops around its page and the rows of the iterators around it);
 * copies are left to their iterator. Then the iterators the edit reached (`syncIterators`,
 * outermost first) bring their copies in step and fill them. The root scope (each source by
 * name) and each iterator's rows are built once per run.
 */
export function syncData(doc: CanvasDocument, change: EditedChange, kinds: ElementKinds): void {
  // A card wrapped in place: the wrapper becomes the card (before the copies it held are freed).
  followWrappedTemplate(doc, change);
  // Copies that lost their iterator become ordinary layers.
  sweepOrphans(doc, change);
  fillData(doc, affectedData(doc, change), change.before, kinds);
}

/**
 * Fills the layers under `nodeIds` (each root and what it holds) and brings the iterators among
 * them in step, as the sync does for an edit but with no hand edits to read, in the current
 * transaction: for a module that changed what is around those layers (a brochure page's rows)
 * without editing them.
 */
export function syncDataFor(
  doc: CanvasDocument,
  nodeIds: readonly string[],
  kinds: ElementKinds,
): void {
  const roots: string[] = [];
  const own: DesignNode[] = [];
  for (const id of nodeIds) {
    const el = doc.get(id);
    if (!el) continue;
    roots.push(id);
    if (isDesignNode(el)) own.push(el);
  }
  if (roots.length === 0) return;
  const layers = [...own, ...walkDescendants(childrenMap(doc), roots)];
  const affected: AffectedData = { all: false, nodes: [], iterators: [] };
  for (const el of layers) {
    if (repeatOf(el)) affected.iterators.push(el.id);
    if (hasDataFields(el)) affected.nodes.push(el.id);
  }
  fillData(doc, affected, new Map(), kinds);
}

/** Plans and writes what `affected` asks for; `before` holds the edit's hand edits (none: an empty map). */
function fillData(
  doc: CanvasDocument,
  affected: AffectedData,
  before: ReadonlyMap<string, Readonly<Record<string, unknown>>>,
  kinds: ElementKinds,
): void {
  if (!affected.all && affected.nodes.length === 0 && affected.iterators.length === 0) return;

  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const root = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const scopes = dataScopes(doc, root, dataPhase(doc));
  const pictures = picturesBySource(doc, sources);
  const ctx: BindingContext = {
    kinds,
    locale: getLocale(),
    images: (value, sourceId) => pictures.get(sourceId)?.get(imageKey(value)) ?? null,
  };
  // A layer's language: its page's (a brochure's), else the app's; one context per language.
  const byLocale = new Map<string, BindingContext>([[ctx.locale, ctx]]);
  const ctxOf = (el: CanvasElement): BindingContext => {
    const locale = scopes.localeFor(el) ?? ctx.locale;
    let found = byLocale.get(locale);
    if (!found) byLocale.set(locale, (found = { ...ctx, locale }));
    return found;
  };

  const patches = new Map<string, ElementPatch>();
  const iterators = affected.all ? [] : [...affected.iterators];
  const plan = (el: CanvasElement) => {
    if (affected.all && repeatOf(el)) iterators.push(el.id);
    // A copy is its iterator's to fill, with no hand-edit rules: it follows its template.
    if (dataCopyTag(el)) return;
    const edited = before.get(el.id);
    const patch = planLayer(el, edited, affected.all, scopes.scopeFor(el), ctxOf(el));
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
  if (iterators.length > 0) syncIterators(doc, iterators, scopes, ctxOf);
}
