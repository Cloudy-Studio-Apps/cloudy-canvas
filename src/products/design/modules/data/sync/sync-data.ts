import type {
  CanvasDocument,
  CanvasElement,
  EditedChange,
  ElementKinds,
  ElementPatch,
} from "@canvas";
import { getLocale } from "@shared/core";

import { isDesignNode } from "../../core";
import { hasDataFields, planBindings, rootScope } from "../bindings";
import type { BindingContext } from "../bindings";
import { dataSourcesIn } from "../source";
import { imageKey, readSnapshot } from "../update";
import { affectedData } from "./affected-data";
import { droppedBindings, droppedVisibility } from "./hand-edits";

/**
 * The data module's `afterEdit` hook, in the edit's undo step: fills the layers the edit asks
 * for (`affectedData`: every bound layer when a source's data changed, else the changed bound
 * layers) from the sources' rows, writing only what differs, so its own writes, which run it
 * again, end it. A hand edit of a data-bound field unlinks it (`droppedBindings`,
 * `droppedVisibility`), as variables do. The root scope (each source by name) is built once per run; layers holding a
 * catalog template are the catalog's to fill.
 */
export function syncData(doc: CanvasDocument, change: EditedChange, kinds: ElementKinds): void {
  const affected = affectedData(doc, change);
  if (!affected.all && affected.nodes.length === 0) return;

  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const scope = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const images = new Map<string, string>();
  for (const source of sources) {
    for (const [key, assetId] of Object.entries(source.images)) {
      if (!images.has(key)) images.set(key, assetId);
    }
  }
  const ctx: BindingContext = {
    kinds,
    locale: getLocale(),
    images: (value) => images.get(imageKey(value)) ?? null,
  };

  const patches = new Map<string, ElementPatch>();
  const plan = (el: CanvasElement) => {
    if (!isDesignNode(el) || !hasDataFields(el)) return;
    if ((el as { catalogText?: unknown }).catalogText !== undefined) return;
    // An edit that also changed a source is the sync's to own: nothing in it unlinks.
    const before = affected.all ? undefined : change.before.get(el.id);
    const unlinked = before ? droppedBindings(el, before, scope, ctx) : null;
    const node = unlinked ? ({ ...el, ...unlinked } as typeof el) : el;
    const planned = planBindings(node, scope, ctx).patch as Record<string, unknown> | null;
    const hidden = before ? droppedVisibility(node, before, planned) : null;
    const patch = { ...planned };
    // The eye's choice stays.
    if (hidden) delete patch.visible;
    const all = { ...unlinked, ...hidden, ...patch };
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
