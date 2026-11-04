import type {
  CanvasDocument,
  CanvasElement,
  EditedChange,
  ElementKinds,
  ElementPatch,
} from "@canvas";
import { getLocale } from "@shared/core";

import { isDesignNode } from "../../core";
import {
  carriedTemplate,
  hasDataFields,
  isCatalogText,
  planBindings,
  rootScope,
} from "../bindings";
import type { BindingContext } from "../bindings";
import { dataSourcesIn, type DataSourceElement } from "../source";
import { imageKey, readSnapshot } from "../update";
import { affectedData } from "./affected-data";
import { droppedBindings, droppedVisibility, replacedByVariables } from "./hand-edits";

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
 * again, end it. A variable bound over a data-bound field replaces its data binding
 * (`replacedByVariables`); a hand edit of a data-bound field unlinks it (`droppedBindings`,
 * `droppedVisibility`), as variables do; a style edit of a bound text's shown runs is carried
 * into its template (`carriedTemplate`), so it sticks. The root scope (each source by name) is
 * built once per run; layers holding a catalog template are the catalog's to fill.
 */
export function syncData(doc: CanvasDocument, change: EditedChange, kinds: ElementKinds): void {
  const affected = affectedData(doc, change);
  if (!affected.all && affected.nodes.length === 0) return;

  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const scope = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const pictures = picturesBySource(doc, sources);
  const ctx: BindingContext = {
    kinds,
    locale: getLocale(),
    images: (value, sourceId) => pictures.get(sourceId)?.get(imageKey(value)) ?? null,
  };

  const patches = new Map<string, ElementPatch>();
  const plan = (el: CanvasElement) => {
    if (!isDesignNode(el) || !hasDataFields(el)) return;
    if (isCatalogText(el)) return;
    const edited = change.before.get(el.id);
    // One binding per field: a variable bound in this edit wins, even beside a source change.
    const replaced = edited ? replacedByVariables(el, edited) : null;
    let node = replaced ? ({ ...el, ...replaced } as typeof el) : el;
    // An edit that also changed a source is the sync's to own: nothing in it unlinks.
    const before = affected.all ? undefined : edited;
    const unlinked = before ? droppedBindings(node, before, scope, ctx) : null;
    if (unlinked) node = { ...node, ...unlinked } as typeof el;
    // Runs styled outside the editor (Typography, a text style, an agent) restyle the template.
    const carried = before && "runs" in before ? carriedTemplate(node, scope, ctx.locale) : null;
    if (carried) node = { ...node, dataText: carried } as typeof el;
    const planned = planBindings(node, scope, ctx).patch as Record<string, unknown> | null;
    const hidden = before ? droppedVisibility(node, before, planned) : null;
    const patch = { ...planned };
    // The eye's choice stays.
    if (hidden) delete patch.visible;
    const all = {
      ...replaced,
      ...unlinked,
      ...(carried ? { dataText: carried } : {}),
      ...hidden,
      ...patch,
    };
    if (Object.keys(all).length > 0) patches.set(el.id, all as ElementPatch);
  };
  if (affected.all) for (const el of doc.all()) plan(el);
  else {
    for (const id of affected.nodes) {
      const el = doc.get(id);
      if (el) plan(el);
    }
  }
  if (patches.size > 0) doc.updateMany(patches);
}
