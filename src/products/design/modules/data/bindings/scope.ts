import type { CanvasDocument } from "@canvas";

import type { DataField, DataSourceElement } from "../source";
import { dataSourcesIn } from "../source/data-sources-in";
import { readSnapshot } from "../update/snapshot";
import { formatPath, parsePath } from "../table";
import type { DataRow, PathStep } from "../table";
import { fieldKey, sampleExpression } from "./field-key";
import type { DataScope, LookupResult, ScopeName } from "./scope.types";

const COUNT = "$count";

/** The root scope: each source by name is its rows array, with its fields keyed for lookup. */
export function rootScope(
  sources: DataSourceElement[],
  rowsOf: (id: string) => readonly DataRow[],
): DataScope {
  const names: Record<string, unknown> = {};
  const fields = new Map<string, DataField>();
  for (const source of sources) {
    names[source.name] = rowsOf(source.id);
    for (const field of source.fields) {
      let steps: PathStep[];
      try {
        steps = parsePath(field.path);
      } catch {
        continue;
      }
      fields.set(fieldKey([{ key: source.name }, { index: 0 }, ...steps]), field);
    }
  }
  return { names, parent: null, fields };
}

/**
 * The names a layer's expressions read: for now the root scope, every source of the document by
 * name. Phase 3 adds the scopes of the repeats around the node (`_nodeId` is for them).
 */
export function scopeAt(doc: CanvasDocument, _nodeId: string): DataScope {
  const sources = dataSourcesIn(doc);
  const byId = new Map(sources.map((source) => [source.id, source]));
  return rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
}

/** A scope inside another: an iterator's row, a template's own names. */
export function childScope(
  parent: DataScope,
  names: Record<string, unknown>,
  fields: Map<string, DataField> = new Map(),
): DataScope {
  return { names, parent, fields };
}

/** Reads an expression: its first step up the chain of scopes, the rest from that value. */
export function lookup(scope: DataScope, expr: string): LookupResult | null {
  let steps: PathStep[];
  try {
    steps = parsePath(expr);
  } catch {
    return null;
  }
  const first = steps[0];
  if (!first || !("key" in first)) return null;
  for (let s: DataScope | null = scope; s; s = s.parent) {
    if (!Object.hasOwn(s.names, first.key)) continue;
    const rest = steps.slice(1);
    const base = s.names[first.key];
    const field = s.fields.get(fieldKey(steps)) ?? null;
    if (rest.length === 0) return { value: base, field };
    if (Array.isArray(base) && rest.length === 1) {
      const only = rest[0] as PathStep;
      if ("key" in only && only.key === COUNT) return { value: base.length, field: null };
    }
    return { value: readSteps(base, rest), field };
  }
  return null;
}

function readSteps(value: unknown, steps: PathStep[]): unknown {
  let cur = value;
  for (const step of steps) {
    if (cur === null || typeof cur !== "object") return undefined;
    if ("index" in step) {
      cur = Array.isArray(cur)
        ? cur[step.index]
        : (cur as Record<string, unknown>)[String(step.index)];
    } else {
      if (Array.isArray(cur) || !Object.hasOwn(cur, step.key)) return undefined;
      cur = (cur as Record<string, unknown>)[step.key];
    }
  }
  return cur;
}

/** Every expression a picker can offer here, the nearest scope's names first. */
export function namesInScope(scope: DataScope): ScopeName[] {
  const out: ScopeName[] = [];
  const seen = new Set<string>();
  for (let s: DataScope | null = scope; s; s = s.parent) {
    for (const [name, value] of Object.entries(s.names)) {
      if (seen.has(name)) continue;
      seen.add(name);
      if (Array.isArray(value)) {
        out.push({ expr: formatPath([{ key: name }, { key: COUNT }]), field: null });
      } else if (value === null || typeof value !== "object") {
        out.push({ expr: formatPath([{ key: name }]), field: null });
      }
    }
    for (const [key, field] of s.fields) {
      const first = parsePath(sampleExpression(key))[0];
      if (first && "key" in first && seen.has(first.key) && !Object.hasOwn(s.names, first.key))
        continue;
      out.push({ expr: sampleExpression(key), field });
    }
  }
  return out;
}
