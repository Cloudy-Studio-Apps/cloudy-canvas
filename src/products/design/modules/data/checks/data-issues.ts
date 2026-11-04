import type { CanvasDocument } from "@canvas";
import { getLocale } from "@shared/core";

import { isDesignNode } from "../../core";
import { isFrame } from "../../frame";
import { hasDataFields, isCatalogText, rootScope } from "../bindings";
import type { BindingContext } from "../bindings";
import { dataCopyTag, repeatOf } from "../repeat/repeat-fields";
import { dataScopes } from "../repeat/data-scopes";
import { dataSourcesIn } from "../source";
import { readSnapshot } from "../update";
import type { DataIssueOptions, DataIssues } from "./data-issues.types";
import { iteratorIssues } from "./iterator-issues";
import { nodeIssues } from "./node-issues";
import { IssueSink } from "./sink";
import { sourceIssues } from "./source-issues";

/**
 * The data that doesn't fit, for the Data tab and agents: a bound layer's expressions that read
 * nothing (in its own scope, through `planBindings`), a fixed-size bound text taller than its
 * box, an iterator with over 500 copies and no `designLimit`, copies stacked for want of an auto
 * layout, detached rows gone from the list, and, with the service, each source's last Update
 * error, pictures it couldn't save and whether it was never updated. The root scope and the
 * iterators' rows are made once per call; it stops after `MAX_ISSUES` (`truncated`). A copy is
 * left to its template, which says the same.
 */
export function dataIssues(doc: CanvasDocument, options: DataIssueOptions = {}): DataIssues {
  const sink = new IssueSink();
  const limit = options.nodes ? new Set(options.nodes) : null;
  if (options.sources && !limit) sourceIssues(options.sources, sink);

  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const root = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const scopes = dataScopes(doc, root);
  const kinds = options.kinds;
  const ctx: BindingContext | null = kinds
    ? { kinds, locale: getLocale(), images: () => null }
    : null;

  for (const el of doc.all()) {
    if (sink.full()) break;
    if (limit && !limit.has(el.id)) continue;
    if (!isDesignNode(el)) continue;
    if (isFrame(el) && repeatOf(el)) iteratorIssues(doc, el, scopes, sink);
    if (ctx && !dataCopyTag(el) && hasDataFields(el) && !isCatalogText(el)) {
      nodeIssues(el, scopes.scopeFor(el), ctx, sink);
    }
  }
  return sink.result();
}
