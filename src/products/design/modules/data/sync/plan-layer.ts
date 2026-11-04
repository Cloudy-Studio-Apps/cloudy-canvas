import type { CanvasElement, ElementPatch } from "@canvas";

import { isDesignNode } from "../../core";
import { carriedTemplate, hasDataFields, isCatalogText, planBindings } from "../bindings";
import type { BindingContext, DataScope } from "../bindings";
import { droppedBindings, droppedVisibility, replacedByVariables } from "./hand-edits";

/**
 * What one layer's data writes, `null` when nothing. `edited` is the edit's `before` for the
 * layer (absent: nothing of it was edited by hand, as for a layer the sync itself wrote, such as
 * an iterator's copies). `owned`: the edit also changed a source, so nothing in it unlinks. A
 * variable bound over a data-bound field replaces its data binding (`replacedByVariables`); a
 * hand edit of a data-bound field unlinks it (`droppedBindings`, `droppedVisibility`); a style
 * edit of a bound text's shown runs is carried into its template (`carriedTemplate`). Layers
 * holding a catalog template are the catalog's to fill.
 */
export function planLayer(
  el: CanvasElement,
  edited: Readonly<Record<string, unknown>> | undefined,
  owned: boolean,
  scope: DataScope,
  ctx: BindingContext,
): ElementPatch | null {
  if (!isDesignNode(el) || !hasDataFields(el)) return null;
  if (isCatalogText(el)) return null;
  // One binding per field: a variable bound in this edit wins, even beside a source change.
  const replaced = edited ? replacedByVariables(el, edited) : null;
  let node = replaced ? ({ ...el, ...replaced } as typeof el) : el;
  // An edit that also changed a source is the sync's to own: nothing in it unlinks.
  const before = owned ? undefined : edited;
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
  return Object.keys(all).length > 0 ? (all as ElementPatch) : null;
}
