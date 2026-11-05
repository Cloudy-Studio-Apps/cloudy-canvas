import type { CanvasDocument } from "@canvas";
import { getLocale } from "@shared/core";

import { isDesignNode, type DesignNode } from "../../core";
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
 * box (measured in the layer's language: a brochure page's own, else the app's), an iterator making over 500 copies (a `designLimit` set that high), copies stacked for
 * want of an auto layout, detached rows gone from the list, and, with the service, each source's
 * last Update error, pictures it couldn't save and whether it was never updated. The root scope and the
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
  // One context per language: a brochure page's data is written in the brochure's.
  const contexts = new Map<string, BindingContext>();
  const contextFor = (el: DesignNode): BindingContext | null => {
    if (!kinds) return null;
    const locale = scopes.localeFor(el) ?? getLocale();
    let ctx = contexts.get(locale);
    if (!ctx) contexts.set(locale, (ctx = { kinds, locale, images: () => null }));
    return ctx;
  };

  for (const el of doc.all()) {
    if (sink.full()) break;
    if (limit && !limit.has(el.id)) continue;
    if (!isDesignNode(el)) continue;
    if (isFrame(el) && repeatOf(el) && !dataCopyTag(el)) iteratorIssues(doc, el, scopes, sink);
    if (kinds && !dataCopyTag(el) && hasDataFields(el) && !isCatalogText(el)) {
      const ctx = contextFor(el);
      if (ctx) nodeIssues(el, scopes.scopeFor(el), ctx, sink);
    }
  }
  return sink.result();
}
