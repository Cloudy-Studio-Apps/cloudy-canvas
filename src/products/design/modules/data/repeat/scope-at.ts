import type { CanvasDocument } from "@canvas";

import { rootScope } from "../bindings";
import type { DataScope } from "../bindings";
import { dataSourcesIn } from "../source";
import { readSnapshot } from "../update";
import { dataScopes } from "./data-scopes";

/**
 * The names a layer's expressions read: every source of the document by name, and from the
 * layer up, each iterator around it adds the row the layer belongs to (a copy's row, the
 * template's preview row; `dataScopes`). For one question (the Data section, `bindData`, an
 * agent); the sync builds its root scope once and asks `dataScopes` for every layer.
 */
export function scopeAt(doc: CanvasDocument, nodeId: string): DataScope {
  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const root = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const el = doc.get(nodeId);
  return el ? dataScopes(doc, root).scopeFor(el) : root;
}
