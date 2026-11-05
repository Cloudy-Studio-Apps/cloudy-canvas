import type { CanvasDocument, CanvasElement } from "@canvas";

import { dataFieldsOf, parseTokens } from "../bindings";
import { childrenMap, documentScopes, repeatOf, walkDescendants } from "../repeat";
import { dataSourcesIn } from "../source";
import { sourceReadBy } from "./source-of";

/** Every expression a layer reads: its text's tokens, its bindings, its condition, its list. */
function expressionsOf(el: CanvasElement): string[] {
  const fields = dataFieldsOf(el);
  const out: string[] = [];
  if (fields.dataText) {
    for (const part of parseTokens(fields.dataText.text)) {
      if (part.kind === "token") out.push(part.expr);
    }
  }
  for (const binding of Object.values(fields.dataBindings ?? {})) out.push(binding.path);
  if (fields.dataVisible) out.push(fields.dataVisible.path);
  const repeat = repeatOf(el);
  if (repeat) out.push(repeat.source);
  return out;
}

/**
 * The ids of the sources the layers under `roots` (them included) read, each in its own scope
 * (a row name reads its list's source; the loops around a page included): what their bindings,
 * conditions and iterators' lists name, those whose data can't be read here included
 * (`sourceReadBy`). For an export that asks whether to update them first.
 */
export function sourcesRead(doc: CanvasDocument, roots: readonly string[]): Set<string> {
  const found = new Set<string>();
  const present = roots.filter((id) => doc.get(id) !== undefined);
  if (present.length === 0) return found;
  const layers = [
    ...present.flatMap((id) => {
      const el = doc.get(id);
      return el ? [el] : [];
    }),
    ...walkDescendants(childrenMap(doc), present),
  ];
  const scopes = documentScopes(doc);
  const byName = new Map(dataSourcesIn(doc).map((source) => [source.name, source.id]));
  for (const el of layers) {
    const exprs = expressionsOf(el);
    if (exprs.length === 0) continue;
    const scope = scopes.scopeFor(el);
    for (const expr of exprs) {
      const id = sourceReadBy(scope, expr, byName);
      if (id) found.add(id);
    }
  }
  return found;
}
